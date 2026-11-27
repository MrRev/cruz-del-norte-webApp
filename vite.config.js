import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  // Candado: estas credenciales quedarían dentro del JavaScript publicado. Con la
  // cuenta de servicio cualquiera podría leer las reservas, DNI y pagos de todos
  // los pasajeros; con el token de DNI, gastar la cuenta de pago de apiperu.
  // Para un build en tu PC: `npm run build:local`.
  const secrets = ['VITE_API_PASSWORD', 'VITE_DNI_API_TOKEN', 'VITE_DNI_API_KEY'].filter(name => env[name])
  if (command === 'build' && mode === 'production' && secrets.length) {
    throw new Error(
      `No se puede compilar para producción con ${secrets.join(', ')}: quedarían expuestas en el `
      + 'JavaScript del navegador. Hace falta que el backend tenga endpoints públicos y la consulta de DNI (ver README). '
      + 'Para probar un build en tu PC use `npm run build:local`.',
    )
  }
  return { plugins: [react(), tailwindcss()] }
})
