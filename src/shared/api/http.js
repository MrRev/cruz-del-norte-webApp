// Cliente HTTP de la web pública. A diferencia de la consola, nunca envía
// tokens del personal: solo consume endpoints públicos del gateway.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cruzdelnorte.duckdns.org'
export const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'true') !== 'false'

export async function request(path, options = {}) {
  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const raw = await response.text()
  let data = null
  try { data = raw ? JSON.parse(raw) : null } catch { data = raw }
  if (!response.ok) {
    const error = new Error(data?.mensaje || data?.detail || `Error ${response.status} en ${path}`)
    error.status = response.status
    error.data = data
    throw error
  }
  return data
}

// Simula la latencia de red en modo de datos de ejemplo.
export const delay = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms))
