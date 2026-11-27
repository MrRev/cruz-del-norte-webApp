// GET /api/asientos?idViaje=3101
// Mapa de asientos (SC-01): estado y precio. Se quita el id de las reservas
// de otros clientes, que no hace falta en el navegador.
import { backend, handle, json, positiveInt } from './_lib/backend.js'

export const GET = handle(async request => {
  const idViaje = positiveInt(new URL(request.url).searchParams.get('idViaje'), 'El viaje')
  const map = await backend(`/api/v1/viajes/${idViaje}/asientos`)
  map.asientos = (map.asientos || []).map(({ idReserva, ...seat }) => seat)
  return json(map)
})
