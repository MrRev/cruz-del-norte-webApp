import { USE_MOCKS, delay, request } from '../../../shared/api/http'

// Endpoint público propuesto: GET /api/v1/publico/pasajes/{codigo}?dni=
export async function findTicket({ codigo, dni }) {
  if (USE_MOCKS) {
    await delay()
    if (codigo.trim().toUpperCase() === 'CN-DEMO-001' && dni === '45871236') {
      return { codigo: 'CN-DEMO-001', estado: 'EMITIDO', origen: 'Lima', destino: 'Trujillo', fecha: '2026-12-15', horaSalida: '08:15', asiento: 14, pasajero: 'Ana Rojas Vega', documentoUrl: null }
    }
    const error = new Error('No encontramos un pasaje con ese código y DNI.')
    error.status = 404
    throw error
  }
  const params = new URLSearchParams({ dni })
  return request(`/api/v1/publico/pasajes/${encodeURIComponent(codigo.trim())}?${params}`)
}
