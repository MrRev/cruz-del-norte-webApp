import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  // Candado: la contraseña de la cuenta de servicio quedaría dentro del
  // JavaScript publicado, y con ella cualquiera podría leer las reservas, DNI y
  // pagos de todos los pasajeros. Para un build en tu PC: `npm run build:local`.
  if (command === 'build' && mode === 'production' && env.VITE_API_PASSWORD) {
    throw new Error(
      'No se puede compilar para producción con VITE_API_PASSWORD: la cuenta de servicio quedaría '
      + 'expuesta en el navegador. Hace falta que el backend tenga endpoints públicos (ver README). '
      + 'Para probar un build en tu PC use `npm run build:local`.',
    )
  }
  return { plugins: [react(), tailwindcss()] }
})
