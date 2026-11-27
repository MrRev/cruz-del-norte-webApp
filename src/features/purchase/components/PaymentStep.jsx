import { Loader2, Lock } from 'lucide-react'
import { formatSoles } from '../../../shared/format'

// Pago con la pasarela que tenga configurada el backend (SC-04). Hoy el backend
// no tiene una pasarela real (Culqi no está implementado) y aprueba los pagos con
// su simulador; cuando exista, aquí irá el formulario de tarjeta (Culqi.js).
export function PaymentStep({ seats, passengers, total, busy, onBack, onPay }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-ink">Pago</h2>
      <p className="mt-1 text-sm text-ink-soft">Revisa tu compra antes de pagar.</p>

      <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
        {seats.map(seat => {
          const p = passengers[seat.idReserva]
          return (
            <li key={seat.idReserva} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold text-ink">{p?.nombres} {p?.apellidos}</p>
                <p className="text-sm text-ink-soft">DNI {p?.dni} · Asiento {seat.numero}, piso {seat.piso}</p>
              </div>
              <span className="font-bold text-ink">{formatSoles(seat.precio)}</span>
            </li>
          )
        })}
      </ul>

      <p className="mt-5 flex items-center gap-2 text-sm text-ink-soft">
        <Lock size={15} className="shrink-0 text-pine-600" aria-hidden="true" />
        <span><strong className="font-semibold text-pine-700">Pago seguro.</strong> Tu compra está protegida y nunca se procesa dos veces.</span>
      </p>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" onClick={onBack} disabled={busy} className="h-12 rounded-lg px-5 font-semibold text-ink-soft hover:bg-mint-50">← Editar pasajeros</button>
        <button type="button" onClick={onPay} disabled={busy} className="flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 font-bold text-pine-900 transition hover:bg-amber-500 disabled:opacity-60">
          {busy ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Procesando pago…</> : `Pagar ${formatSoles(total)}`}
        </button>
      </div>
    </div>
  )
}
