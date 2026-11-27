// POST /api/dni  { dni, token }
// Nombres y apellidos por DNI (apiperu.pe). El token de apiperu queda en el
// servidor. Solo responde a quien tiene un asiento retenido (token de compra)
// y con límite por IP, para que nadie consulte DNI al por mayor.
import { HttpError, handle, json, rateLimit, readJson, verifyPurchase } from './_lib/backend.js'

export const POST = handle(async request => {
  const body = await readJson(request)
  verifyPurchase(body.token)
  const dni = String(body.dni ?? '')
  if (!/^\d{8}$/.test(dni)) throw new HttpError(400, 'El DNI debe tener 8 dígitos.')

  const token = process.env.DNI_API_TOKEN || ''
  const key = process.env.DNI_API_KEY || ''
  if (!token && !key) throw new HttpError(501, 'La búsqueda por DNI no está disponible.')
  rateLimit(request, 'dni', 20, 10 * 60_000)

  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (key) headers['X-API-Key'] = key
  let response
  try {
    response = await fetch(`${(process.env.DNI_API_URL || 'https://api.apiperu.pe').replace(/\/$/, '')}/dni`, { method: 'POST', headers, body: JSON.stringify({ dni }) })
  } catch {
    throw new HttpError(503, 'No pudimos consultar el DNI. Escribe los datos manualmente.')
  }
  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.success || !data.data) throw new HttpError(404, 'No encontramos ese DNI. Escribe los nombres y apellidos.')
  const person = data.data
  return json({
    nombres: (person.nombres || '').trim(),
    apellidos: [person.apellido_paterno, person.apellido_materno].filter(Boolean).join(' ').trim(),
  })
})
