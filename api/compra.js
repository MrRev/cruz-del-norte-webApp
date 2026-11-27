// POST /api/compra  { accion, ... }
// Flujo de compra contra SC-02, SC-04 y SC-05. Cada asiento retenido recibe un
// token de compra firmado; las demás acciones exigen ese token y solo actúan
// sobre su reserva.
//
//   retener  { idViaje, idAsiento }                 → { ...reserva, token }
//   liberar  { token }
//   pasajero { token, dni, nombres, apellidos }
//   pagar    { token, importe, idempotencyKey }     → { idTransaccion, estado }
//   emitir   { token, idTransaccion }               → { codigo, documentoUrl, ... }
import { HttpError, backend, handle, json, positiveInt, rateLimit, readJson, signPurchase, verifyPurchase } from './_lib/backend.js'

const text = (value, name, max = 120) => {
  const clean = String(value ?? '').trim()
  if (!clean || clean.length > max) throw new HttpError(400, `${name} no es válido.`)
  return clean
}

const actions = {
  async retener(body, request) {
    rateLimit(request, 'retener', 30, 10 * 60_000)
    const idViaje = positiveInt(body.idViaje, 'El viaje')
    const idAsiento = positiveInt(body.idAsiento, 'El asiento')
    const hold = await backend('/api/v1/reservas/hold', { method: 'POST', body: JSON.stringify({ idViaje, idAsiento, idCanal: 1 }) })
    return { ...hold, token: signPurchase({ idReserva: hold.idReserva, idViaje }) }
  },

  async liberar(body) {
    const { idReserva } = verifyPurchase(body.token)
    return backend(`/api/v1/reservas/${idReserva}/liberacion`, { method: 'POST' })
  },

  async pasajero(body) {
    const { idReserva } = verifyPurchase(body.token)
    const dni = String(body.dni ?? '')
    if (!/^\d{8}$/.test(dni)) throw new HttpError(400, 'El DNI debe tener 8 dígitos.')
    const pasajero = { dni, nombres: text(body.nombres, 'Los nombres'), apellidos: text(body.apellidos, 'Los apellidos') }
    return backend(`/api/v1/reservas/${idReserva}/pasajero`, { method: 'PATCH', body: JSON.stringify(pasajero) })
  },

  async pagar(body) {
    const { idReserva } = verifyPurchase(body.token)
    const importe = Number(body.importe)
    if (!Number.isFinite(importe) || importe <= 0) throw new HttpError(400, 'El importe no es válido.')
    const key = text(body.idempotencyKey, 'La clave del pago', 120)
    // El token de la pasarela lo decide el servidor. Hoy el backend no tiene una
    // pasarela real y aprueba con su simulador ("mock_aprobado").
    const tokenPasarela = process.env.PAYMENT_TOKEN_PASARELA || 'mock_aprobado'
    try {
      const pago = await backend('/api/v1/pagos', {
        method: 'POST',
        headers: { 'Idempotency-Key': `web-${idReserva}-${key}` },
        body: JSON.stringify({ idReserva, importe: importe.toFixed(2), medioPago: 'PASARELA', tokenPasarela }),
      })
      return { idTransaccion: pago.idTransaccion, estado: pago.estado }
    } catch (error) {
      // Ya estaba pagada (p. ej. se cortó la conexión): se recupera ese pago.
      if (error.status !== 409 || !/pago aprobado/i.test(error.message)) throw error
      const pago = await backend(`/api/v1/pagos/${idReserva}/aprobado`)
      return { idTransaccion: pago.idTransaccion, estado: 'APROBADO' }
    }
  },

  async emitir(body) {
    const { idReserva } = verifyPurchase(body.token)
    const idTransaccion = text(body.idTransaccion, 'La transacción', 80)
    return backend('/api/v1/pasajes', { method: 'POST', body: JSON.stringify({ idReserva, idTransaccion }) })
  },
}

export const POST = handle(async request => {
  const body = await readJson(request)
  const action = actions[body?.accion]
  if (!action) throw new HttpError(400, 'Acción no válida.')
  return json(await action(body, request))
})
