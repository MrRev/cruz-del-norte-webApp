import { Clock3 } from 'lucide-react'
import { formatLongDate, formatSoles } from '../../../shared/format'

const STEPS = [
  { id: 'asientos', label: 'Asientos' },
  { id: 'pasajeros', label: 'Pasajeros' },
  { id: 'pago', label: 'Pago' },
  { id: 'listo', label: 'Pasajes' },
]

export function Stepper({ step }) {
  const current = STEPS.findIndex(s => s.id === step)
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Pasos de la compra">
      {STEPS.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2" aria-current={i === current ? 'step' : undefined}>
          <span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${i < current ? 'bg-mint-500 text-white' : i === current ? 'bg-amber-400 text-pine-900' : 'bg-white/10 text-mint-50/60'}`}>{i < current ? '✓' : i + 1}</span>
          <span className={`hidden sm:inline ${i === current ? 'font-bold text-white' : 'text-mint-50/60'}`}>{s.label}</span>
          {i < STEPS.length - 1 && <span className="mx-1 h-px w-5 bg-white/20 sm:w-8" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  )
}

export function Countdown({ secondsLeft }) {
  if (secondsLeft == null) return null
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const urgent = secondsLeft < 120
  return (
    <p className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${urgent ? 'bg-red-50 text-red-700' : 'bg-amber-400/15 text-amber-600'}`} role="timer" aria-live={urgent ? 'polite' : 'off'}>
      <Clock3 size={16} aria-hidden="true" /> Tus asientos están reservados por {mm}:{ss}
    </p>
  )
}

export function PurchaseSummary({ trip, seats, total, secondsLeft, showTimer }) {
  return (
    <aside className="h-max rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-24">
      <h2 className="font-bold text-ink">Tu viaje</h2>
      <p className="mt-2 text-lg font-bold text-ink">{trip.origen} → {trip.destino}</p>
      <p className="text-sm text-ink-soft first-letter:uppercase">{formatLongDate(trip.fecha)}{trip.hora && ` · ${trip.hora}`}</p>
      <div className="mt-4 border-t border-line pt-4">
        {seats.length === 0
          ? <p className="text-sm text-muted">Aún no eliges asientos.</p>
          : <ul className="space-y-1.5 text-sm">{seats.map(s => (
              <li key={s.idAsiento} className="flex justify-between text-ink-soft"><span>Asiento {s.numero} · piso {s.piso}</span><span className="font-semibold text-ink">{formatSoles(s.precio)}</span></li>
            ))}</ul>}
      </div>
      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
        <span className="font-semibold text-ink-soft">Total</span>
        <span className="text-2xl font-extrabold text-amber-600">{formatSoles(total)}</span>
      </div>
      {showTimer && <div className="mt-4"><Countdown secondsLeft={secondsLeft} /></div>}
    </aside>
  )
}
