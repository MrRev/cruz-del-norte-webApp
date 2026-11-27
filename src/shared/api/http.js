// Cliente HTTP de la web. Todas las llamadas van a las funciones de servidor
// de este mismo sitio (/api/*, carpeta api/ del repo), que hablan con el
// backend. El navegador nunca recibe credenciales.
export async function request(path, options = {}) {
  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  let response
  try {
    response = await fetch(path, { ...options, headers })
  } catch {
    throw new Error('No pudimos conectar con el sistema de ventas. Revisa tu conexión e intenta nuevamente.')
  }
  const raw = await response.text()
  let data = null
  try { data = raw ? JSON.parse(raw) : null } catch { data = null }
  if (!response.ok) {
    const error = new Error(data?.mensaje || 'No pudimos completar la operación. Intenta nuevamente.')
    error.status = response.status
    throw error
  }
  return data
}

export const postJson = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
