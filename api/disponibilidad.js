// GET /api/disponibilidad?origen=Lima&destino=Ica&fecha=2026-12-01
// Salidas de una ruta y fecha (SC-01). Sin datos personales.
import { HttpError, backend, handle, json } from './_lib/backend.js'

export const GET = handle(async request => {
  const url = new URL(request.url)
  const origen = (url.searchParams.get('origen') || '').trim()
  const destino = (url.searchParams.get('destino') || '').trim()
  const fecha = url.searchParams.get('fecha') || ''
  if (!origen || !destino || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new HttpError(400, 'Completa origen, destino y fecha.')
  const data = await backend(`/api/v1/viajes/disponibilidad?${new URLSearchParams({ origen, destino, fecha })}`)
  const body = data || { origen, destino, fecha, viajes: [] } // 204 = sin salidas
  return json(body, 200, { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' })
})
