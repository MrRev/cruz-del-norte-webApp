// Consulta de nombres por DNI con apiperu.pe, igual que la consola de
// operaciones. El backend no tiene esta consulta (SC-03 solo valida formato).
//
// El token es una credencial de pago y queda dentro del JavaScript: por eso
// vite.config.js impide el build de producción mientras esté configurado.
// Para publicar, esta consulta debe pasar por el backend (con límite de uso).
const DNI_API_URL = (import.meta.env.VITE_DNI_API_URL || 'https://api.apiperu.pe').replace(/\/$/, '')
const DNI_API_TOKEN = import.meta.env.VITE_DNI_API_TOKEN || ''
const DNI_API_KEY = import.meta.env.VITE_DNI_API_KEY || ''

export const DNI_LOOKUP_ENABLED = Boolean(DNI_API_TOKEN || DNI_API_KEY)

// Devuelve { nombres, apellidos } o lanza un Error con un mensaje para el cliente.
export async function lookupDni(dni) {
  if (!DNI_LOOKUP_ENABLED) throw new Error('La búsqueda por DNI no está disponible.')
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' }
  if (DNI_API_TOKEN) headers.Authorization = `Bearer ${DNI_API_TOKEN}`
  if (DNI_API_KEY) headers['X-API-Key'] = DNI_API_KEY

  let response
  try {
    response = await fetch(`${DNI_API_URL}/dni`, { method: 'POST', headers, body: JSON.stringify({ dni }) })
  } catch {
    throw new Error('No pudimos consultar el DNI. Escribe los datos manualmente.')
  }
  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.success || !data.data) {
    throw new Error('No encontramos ese DNI. Escribe los nombres y apellidos.')
  }
  const person = data.data
  return {
    nombres: (person.nombres || '').trim(),
    apellidos: [person.apellido_paterno, person.apellido_materno].filter(Boolean).join(' ').trim(),
  }
}
