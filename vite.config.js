import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  // Candado: el acceso de pruebas con la cuenta de ventas nunca debe publicarse.
  // Para probar un build en local use `npm run build:demo`.
  if (command === 'build' && mode === 'production' && env.VITE_DEMO_VENTAS === 'true') {
    throw new Error(
      'VITE_DEMO_VENTAS=true no está permitido en un build de producción: el token de ventas '
      + 'expondría los datos de todos los pasajeros. Desactívelo o use `npm run build:demo` solo en local.',
    )
  }
  return { plugins: [react(), tailwindcss()] }
})
