import { useEffect, useState } from 'react'
import { AlertCircle, ArrowRight, Users } from 'lucide-react'
import { Link } from 'react-router'
import { getUpcomingTrips } from '../services/travelService'
import { formatLongDate, formatSoles } from '../../../shared/format'
import { UPCOMING_DAYS } from '../services/catalog'

// Todas las salidas con asientos libres de los próximos días, agrupadas por fecha.
export function UpcomingTrips() {
  const [state, setState] = useState({ loading: true, error: '', trips: [] })

  useEffect(() => {
    let active = true
    getUpcomingTrips()
      .then(trips => active && setState({ loading: false, error: '', trips }))
      .catch(error => active && setState({ loading: false, error: error.message || 'No pudimos cargar las salidas.', trips: [] }))
    return () => { active = false }
  }, [])

  if (state.loading) return <div className="grid gap-3" aria-busy="true">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white" />)}</div>
  if (state.error) return <p className="flex items-center gap-2 rounded-xl bg-white p-5 text-ink-soft"><AlertCircle size={18} className="text-amber-600" aria-hidden="true" /> {state.error}</p>
  if (!state.trips.length) return <p className="rounded-xl bg-white p-5 text-ink-soft">No hay salidas con asientos disponibles en los próximos {UPCOMING_DAYS} días.</p>

  const byDate = state.trips.reduce((acc, trip) => ({ ...acc, [trip.fecha]: [...(acc[trip.fecha] || []), trip] }), {})

  return (
    <div className="space-y-8">
      {Object.entries(byDate).map(([fecha, trips]) => (
        <section key={fecha} aria-labelledby={`dia-${fecha}`}>
          <h3 id={`dia-${fecha}`} className="mb-3 text-sm font-bold tracking-wide text-ink-soft uppercase first-letter:uppercase">{formatLongDate(fecha)}</h3>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
            {trips.map(trip => {
              const libres = trip.asientosDisponibles.length
              return (
                <li key={trip.idViaje} className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3.5 sm:px-5">
                  <span className="w-14 text-xl font-extrabold tracking-tight text-pine-600">{trip.horaSalida}</span>
                  <span className="min-w-36 flex-1">
                    <span className="block font-bold text-ink">{trip.origen} → {trip.destino}</span>
                    <span className={`flex items-center gap-1 text-sm ${libres <= 8 ? 'font-semibold text-amber-600' : 'text-ink-soft'}`}>
                      <Users size={13} aria-hidden="true" /> {libres <= 8 ? `¡Últimos ${libres}!` : `${libres} asientos libres`}{trip.duracion && <span className="text-muted"> · {trip.duracion}</span>}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-[11px] text-muted">desde</span>
                    <span className="font-extrabold text-amber-600">{formatSoles(trip.tarifa)}</span>
                  </span>
                  <Link
                    to={`/compra/${trip.idViaje}?${new URLSearchParams({ origen: trip.origen, destino: trip.destino, fecha: trip.fecha, hora: trip.horaSalida })}`}
                    className="flex h-10 items-center gap-1 rounded-lg bg-amber-400 px-4 text-sm font-bold text-pine-900 transition hover:bg-amber-500"
                  >
                    Elegir asiento <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
