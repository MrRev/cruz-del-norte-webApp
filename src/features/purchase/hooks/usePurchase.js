import { useCallback, useEffect, useState } from 'react'
import { holdSeat, issueTicket, newIdempotencyKey, pay, releaseSeat, setPassenger } from '../services/purchaseService'

export const MAX_SEATS = 10
const storageKey = idViaje => `cdn-compra-${idViaje}`
const emptyState = { step: 'asientos', seats: [], passengers: {}, payments: {}, tickets: {} }

function load(idViaje) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey(idViaje)) || 'null')
    if (!saved) return emptyState
    // Una compra sin terminar cuyas reservas ya vencieron no se restaura.
    const expired = saved.step !== 'listo' && saved.seats.some(s => new Date(s.vencimiento) <= new Date() || !s.token)
    return expired ? emptyState : { ...emptyState, ...saved }
  } catch {
    return emptyState
  }
}

// Estado y acciones de una compra para un viaje: asientos retenidos →
// pasajeros → pago → pasajes. Se guarda en sessionStorage para sobrevivir a
// una recarga de la página.
export function usePurchase(idViaje) {
  const [state, setState] = useState(() => load(idViaje))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    try { sessionStorage.setItem(storageKey(idViaje), JSON.stringify(state)) } catch { /* modo privado */ }
  }, [idViaje, state])

  // Reloj para la cuenta regresiva de la reserva.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const expiresAt = state.seats.length ? Math.min(...state.seats.map(s => new Date(s.vencimiento).getTime())) : null
  const secondsLeft = expiresAt ? Math.max(0, Math.floor((expiresAt - now) / 1000)) : null
  const expired = state.step !== 'listo' && secondsLeft === 0
  const total = state.seats.reduce((sum, seat) => sum + Number(seat.precio), 0)

  const run = useCallback(async action => {
    setBusy(true); setError('')
    try { return await action() } catch (e) { setError(e.message || 'Ocurrió un error inesperado.'); return null } finally { setBusy(false) }
  }, [])

  const toggleSeat = useCallback(seat => run(async () => {
    const selected = state.seats.find(s => s.idAsiento === seat.idAsiento)
    if (selected) {
      await releaseSeat(selected.token).catch(() => {}) // si ya venció, igual se quita
      setState(s => ({ ...s, seats: s.seats.filter(x => x.idAsiento !== seat.idAsiento) }))
      return
    }
    if (state.seats.length >= MAX_SEATS) throw new Error(`Puedes elegir hasta ${MAX_SEATS} asientos por compra.`)
    const hold = await holdSeat(Number(idViaje), seat.idAsiento)
    setState(s => ({
      ...s,
      seats: [...s.seats, { idAsiento: seat.idAsiento, idReserva: hold.idReserva, token: hold.token, numero: seat.numero, piso: seat.piso, tipo: seat.tipo, precio: seat.precio, vencimiento: hold.vencimiento }],
    }))
  }), [idViaje, run, state.seats])

  const goTo = step => { setError(''); setState(s => ({ ...s, step })) }

  const savePassengers = useCallback(passengers => run(async () => {
    for (const seat of state.seats) await setPassenger(seat.token, passengers[seat.idReserva])
    setState(s => ({ ...s, passengers, step: 'pago' }))
  }), [run, state.seats])

  const payAndIssue = useCallback(() => run(async () => {
    const payments = { ...state.payments }
    const tickets = { ...state.tickets }
    try {
      for (const seat of state.seats) {
        if (tickets[seat.idReserva]) continue // ya emitido en un intento anterior
        let payment = payments[seat.idReserva]
        if (!payment?.idTransaccion) {
          const key = payment?.key || newIdempotencyKey()
          payments[seat.idReserva] = { key }
          // Si ya estaba pagada (p. ej. se cortó la conexión), el servidor devuelve ese pago.
          const result = await pay({ token: seat.token, importe: seat.precio, idempotencyKey: key })
          if (result.estado !== 'APROBADO') {
            delete payments[seat.idReserva] // un nuevo intento necesita otra clave
            throw new Error(result.estado === 'PENDIENTE' ? 'El pago quedó pendiente de confirmación.' : 'El pago fue rechazado. Intenta nuevamente.')
          }
          payment = { key, idTransaccion: result.idTransaccion }
          payments[seat.idReserva] = payment
        }
        tickets[seat.idReserva] = await issueTicket(seat.token, payment.idTransaccion)
      }
      setState(s => ({ ...s, payments, tickets, step: 'listo' }))
    } finally {
      // Conserva lo avanzado (pagos y pasajes) aunque falle un asiento.
      setState(s => ({ ...s, payments, tickets }))
    }
  }), [run, state.payments, state.seats, state.tickets])

  const reset = useCallback(({ release = true } = {}) => {
    // Primero se borra la compra guardada (de forma síncrona: si se llama al
    // salir de la página, un setState posterior ya no tendría efecto) y luego
    // se liberan los asientos en segundo plano.
    const toRelease = release && state.step !== 'listo' ? state.seats : []
    try { sessionStorage.removeItem(storageKey(idViaje)) } catch { /* modo privado */ }
    setError('')
    setState(emptyState)
    return Promise.all(toRelease.map(s => releaseSeat(s.token).catch(() => {})))
  }, [idViaje, state.seats, state.step])

  return { state, busy, error, setError, secondsLeft, expired, total, toggleSeat, goTo, savePassengers, payAndIssue, reset }
}
