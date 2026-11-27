import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

// En desarrollo (`npm run dev`) ejecuta las funciones de la carpeta api/ igual
// que Vercel: /api/<nombre> → api/<nombre>.js, exportando GET/POST con la API
// estándar Request/Response. En Vercel no se usa: allí las corre la plataforma.
function vercelFunctionsInDev() {
  return {
    name: 'vercel-functions-in-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res) => {
        const name = new URL(req.url, 'http://localhost').pathname.replace(/^\/+|\/+$/g, '')
        const file = path.resolve('api', `${name}.js`)
        if (!name || name.startsWith('_') || name.includes('..') || !fs.existsSync(file)) {
          res.statusCode = 404; res.setHeader('Content-Type', 'application/json'); res.end('{"mensaje":"No encontrado."}'); return
        }
        try {
          const mod = await server.ssrLoadModule(file)
          const handler = mod[req.method]
          if (!handler) { res.statusCode = 405; res.end(); return }
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const request = new Request(`http://${req.headers.host}${req.originalUrl}`, {
            method: req.method,
            headers: req.headers,
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
          })
          const response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          server.config.logger.error(error.stack || String(error))
          res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end('{"mensaje":"Error en la función."}')
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Variables del servidor (sin prefijo VITE_) desde .env.local, para las
  // funciones de api/ en desarrollo. Nunca llegan al navegador.
  const serverEnv = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(serverEnv)) {
    if (!key.startsWith('VITE_') && process.env[key] === undefined) process.env[key] = value
  }

  // Candado: lo que empieza con VITE_ se copia al JavaScript público.
  // Las credenciales van sin ese prefijo (ver .env.example).
  const leaked = Object.keys(serverEnv).filter(key => /^VITE_.*(PASSWORD|TOKEN|SECRET|KEY)/.test(key) && serverEnv[key])
  if (leaked.length) {
    throw new Error(`${leaked.join(', ')}: las credenciales no pueden llevar el prefijo VITE_ porque quedarían públicas. Use los nombres de .env.example.`)
  }

  return { plugins: [react(), tailwindcss(), vercelFunctionsInDev()] }
})
