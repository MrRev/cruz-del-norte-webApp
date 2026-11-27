import { request } from '../../../shared/api/http'

// Flujo de compra contra los endpoints actuales del backend (SC-02, SC-04, SC-05).
// Ver README: "Cómo funciona una compra".

const WEB_CHANNEL = 1 // TODO: usar el canal propio de la web cuando el backend lo habilite.

// SC-02: bloquea el asiento apenas se elige (reserva TEMPORAL con vencimiento).
export const holdSeat = (idViaje, idAsiento) =>
  request('/api/v1/reservas/hold', { method: 'POST', body: JSON.stringify({ idViaje, idAsiento, idCanal: WEB_CHANNEL }) })

// SC-02: libera un asiento que el cliente deseleccionó o abandonó.
export const releaseSeat = idReserva =>
  request(`/api/v1/reservas/${idReserva}/liberacion`, { method: 'POST' })

// SC-02: reemplaza el pasajero provisional de la reserva.
export const setPassenger = (idReserva, { dni, nombres, apellidos }) =>
  request(`/api/v1/reservas/${idReserva}/pasajero`, { method: 'PATCH', body: JSON.stringify({ dni, nombres, apellidos }) })

// SC-04: pago. tokenPasarela es el que acepta el simulador del backend mientras
// no exista una pasarela real.
// La misma Idempotency-Key garantiza que un reintento no cobre dos veces.
export const pay = ({ idReserva, importe, idempotencyKey, tokenPasarela = 'mock_aprobado' }) =>
  request('/api/v1/pagos', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ idReserva, importe: Number(importe).toFixed(2), medioPago: 'PASARELA', tokenPasarela }),
  })

export const getApprovedPayment = idReserva => request(`/api/v1/pagos/${idReserva}/aprobado`)

// SC-05: emite el pasaje (PDF) a partir de un pago aprobado.
export const issueTicket = (idReserva, idTransaccion) =>
  request('/api/v1/pasajes', { method: 'POST', body: JSON.stringify({ idReserva, idTransaccion }) })

export function newIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return `web-${crypto.randomUUID()}`
  return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}
