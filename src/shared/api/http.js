import { API_BASE_URL } from './config'
import { getDemoToken } from './demoAuth'

export { API_BASE_URL, USE_MOCKS, DEMO_VENTAS } from './config'

// Cliente HTTP de la web. Solo adjunta un token en el modo de pruebas
// DEMO_VENTAS; en producción consumirá endpoints públicos sin token del personal.
export async function request(path, options = {}, retried = false) {
  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = await getDemoToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  // Token vencido: se renueva una vez y se reintenta.
  if (response.status === 401 && token && !retried) {
    await getDemoToken({ force: true })
    return request(path, options, true)
  }

  const raw = await response.text()
  let data = null
  try { data = raw ? JSON.parse(raw) : null } catch { data = raw }
  if (!response.ok) {
    const error = new Error(data?.mensaje || data?.detail || `Error ${response.status} en ${path}`)
    error.status = response.status
    error.data = data
    throw error
  }
  return data // 204 (sin resultados) devuelve null
}

// Simula la latencia de red en modo de datos de ejemplo.
export const delay = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms))
