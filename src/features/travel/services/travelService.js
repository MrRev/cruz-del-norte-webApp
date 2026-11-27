import { request } from '../../../shared/api/http'
import { todayISO } from '../../../shared/format'
import { OPERATED_ROUTES, UPCOMING_DAYS } from './catalog'

// Salidas de una ruta y fecha (api/disponibilidad.js → SC-01).
export async function searchTrips({ origen, destino, fecha }) {
  const data = await request(`/api/disponibilidad?${new URLSearchParams({ origen, destino, fecha })}`)
  return data || { origen, destino, fecha, viajes: [] }
}

// Mapa de asientos con estado y precio de cada uno (api/asientos.js → SC-01).
export async function getSeatMap(idViaje) {
  return request(`/api/asientos?${new URLSearchParams({ idViaje })}`)
}

const addDays = (iso, days) => {
  const date = new Date(`${iso}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

// Salidas reales de las rutas operadas para los próximos días, ordenadas por
// fecha y hora. Solo lectura. Se guarda en memoria unos minutos para que la
// portada, Destinos y el buscador no repitan las mismas consultas.
const CACHE_MS = 2 * 60_000
let upcomingCache = null // { at, promise }

export function getUpcomingTrips() {
  if (upcomingCache && Date.now() - upcomingCache.at < CACHE_MS) return upcomingCache.promise
  const today = todayISO()
  const dates = Array.from({ length: UPCOMING_DAYS }, (_, i) => addDays(today, i))
  const promise = Promise.all(OPERATED_ROUTES.flatMap(route => dates.map(async fecha => {
    const data = await searchTrips({ origen: route.origen, destino: route.destino, fecha })
    return (data.viajes || []).map(viaje => ({ ...viaje, origen: route.origen, destino: route.destino, fecha, duracion: viaje.duracion || route.duracion }))
  })))
    .then(groups => groups.flat()
      .filter(v => v.asientosDisponibles?.length) // sin asientos libres no se ofrece
      .filter(v => new Date(`${v.fecha}T${v.horaSalida}:00`) > new Date()) // ya salió
      .sort((a, b) => `${a.fecha} ${a.horaSalida}`.localeCompare(`${b.fecha} ${b.horaSalida}`)))
  promise.catch(() => { upcomingCache = null }) // un error no queda guardado
  upcomingCache = { at: Date.now(), promise }
  return promise
}

// Rutas para la portada, Destinos y el buscador, con datos reales:
// precio desde, cantidad de salidas y próxima salida en los próximos días.
export async function getRoutes() {
  const trips = await getUpcomingTrips()
  const rutas = OPERATED_ROUTES.map(route => {
    const own = trips.filter(t => t.origen === route.origen && t.destino === route.destino)
    return {
      ...route,
      desde: own.length ? Math.min(...own.map(t => Number(t.tarifa))) : null,
      salidasSemana: own.length,
      proxima: own[0] ? { fecha: own[0].fecha, hora: own[0].horaSalida } : null,
    }
  })
  const ciudades = [...new Set(OPERATED_ROUTES.flatMap(r => [r.origen, r.destino]))]
  return { ciudades, rutas }
}
