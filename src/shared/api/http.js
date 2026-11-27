import { API_BASE_URL } from './config'
import { getServiceToken } from './serviceAuth'

export { API_BASE_URL } from './config'

// Cliente HTTP de la web: todas las llamadas van al gateway del backend con el
// token de la cuenta de servicio (ver config.js).
export async function request(path, options = {}, retried = false) {
  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = await getServiceToken()
  headers.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('No pudimos conectar con el sistema de ventas. Revisa tu conexión e intenta nuevamente.')
  }

  // Token vencido: se renueva una vez y se reintenta.
  if (response.status === 401 && !retried) {
    await getServiceToken({ force: true })
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
