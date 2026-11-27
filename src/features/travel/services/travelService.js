import { USE_MOCKS, delay, request } from '../../../shared/api/http'
import { CITIES, ROUTES, mockAvailability } from './mockData'

// Las rutas destacadas son contenido de la web (no hay endpoint de catálogo).
// Endpoint público propuesto para el futuro: GET /api/v1/publico/rutas
export async function getRoutes() {
  await delay(USE_MOCKS ? 350 : 0)
  return { ciudades: CITIES, rutas: ROUTES }
}

// SC-01. En el modo de pruebas usa el endpoint actual (requiere rol VENTAS).
// Público propuesto: GET /api/v1/publico/viajes/disponibilidad
export async function searchTrips({ origen, destino, fecha }) {
  if (USE_MOCKS) { await delay(); return mockAvailability({ origen, destino, fecha }) }
  const params = new URLSearchParams({ origen, destino, fecha })
  const data = await request(`/api/v1/viajes/disponibilidad?${params}`)
  return data || { origen, destino, fecha, viajes: [] } // 204 = sin salidas
}

// SC-01: mapa de asientos con estado y precio de cada uno.
export async function getSeatMap(idViaje) {
  return request(`/api/v1/viajes/${idViaje}/asientos`)
}
