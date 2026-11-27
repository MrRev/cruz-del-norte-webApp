import { USE_MOCKS, delay, request } from '../../../shared/api/http'
import { CITIES, ROUTES, mockAvailability } from './mockData'

// Endpoints públicos propuestos para el backend (aún no implementados):
//   GET /api/v1/publico/rutas
//   GET /api/v1/publico/viajes/disponibilidad?origen=&destino=&fecha=

export async function getRoutes() {
  if (USE_MOCKS) { await delay(); return { ciudades: CITIES, rutas: ROUTES } }
  return request('/api/v1/publico/rutas')
}

export async function searchTrips({ origen, destino, fecha }) {
  if (USE_MOCKS) { await delay(); return mockAvailability({ origen, destino, fecha }) }
  const params = new URLSearchParams({ origen, destino, fecha })
  return request(`/api/v1/publico/viajes/disponibilidad?${params}`)
}
