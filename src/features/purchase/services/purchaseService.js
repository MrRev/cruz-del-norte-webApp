import { postJson } from '../../../shared/api/http'

// Flujo de compra a través de api/compra.js (→ SC-02, SC-04, SC-05).
// Al retener un asiento el servidor devuelve un token de compra que solo sirve
// para esa reserva; las demás acciones lo exigen.

// Bloquea el asiento apenas se elige (reserva TEMPORAL con vencimiento).
export const holdSeat = (idViaje, idAsiento) => postJson('/api/compra', { accion: 'retener', idViaje, idAsiento })

// Libera un asiento que el cliente deseleccionó o abandonó.
export const releaseSeat = token => postJson('/api/compra', { accion: 'liberar', token })

// Reemplaza el pasajero provisional de la reserva.
export const setPassenger = (token, { dni, nombres, apellidos }) => postJson('/api/compra', { accion: 'pasajero', token, dni, nombres, apellidos })

// Paga la reserva. La misma clave hace que un reintento no cobre dos veces;
// si ya estaba pagada, el servidor devuelve ese pago.
export const pay = ({ token, importe, idempotencyKey }) => postJson('/api/compra', { accion: 'pagar', token, importe, idempotencyKey })

// Emite el pasaje (PDF) a partir del pago aprobado.
export const issueTicket = (token, idTransaccion) => postJson('/api/compra', { accion: 'emitir', token, idTransaccion })

export function newIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}
