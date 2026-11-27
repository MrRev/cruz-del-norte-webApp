import { useEffect, useState } from 'react'
import { AlertCircle, ArrowRight, BusFront, Clock3, Users } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { Header } from '../shared/ui/Header'
import { SearchForm } from '../features/travel/components/SearchForm'
import { searchTrips } from '../features/travel/services/travelService'
import { BUS_LABEL, formatLongDate, formatSoles } from '../shared/format'

export function SearchResultsPage() {
  const [params] = useSearchParams()
  const origen = params.get('origen') || ''
  const destino = params.get('destino') || ''
  const fecha = params.get('fecha') || ''
  const [state, setState] = useState({ loading: true, error: '', viajes: [] })

  useEffect(() => {
    if (!origen || !destino || !fecha) return setState({ loading: false, error: 'Completa origen, destino y fecha para buscar.', viajes: [] })
    let active = true
    setState({ loading: true, error: '', viajes: [] })
    searchTrips({ origen, destino, fecha })
      .then(data => active && setState({ loading: false, error: '', viajes: data.viajes || [] }))
      .catch(error => active && setState({ loading: false, error: error.message || 'No pudimos consultar las salidas.', viajes: [] }))
    return () => { active = false }
  }, [origen, destino, fecha])

  useEffect(() => { document.title = `${origen} → ${destino} · Cruz del Norte` }, [origen, destino])

  return (
    <>
      <Header />
      <main className="min-h-[70vh] pb-20">
        <div className="bg-pine-900 pt-8 pb-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{origen} → {destino}</h1>
            <p className="mt-1 text-mint-50/70 first-letter:uppercase">{formatLongDate(fecha)}</p>
          </div>
        </div>
        <div className="mx-auto -mt-10 max-w-6xl px-4 sm:px-6">
          <SearchForm key={`${origen}-${destino}-${fecha}`} initial={{ origen, destino, fecha }} compact />

          <section className="mt-8" aria-live="polite" aria-busy={state.loading}>
            {state.loading && <div className="grid gap-3">{Array.from({ length: 3 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />)}</div>}

            {!state.loading && state.error && (
              <p className="flex items-center gap-2 rounded-2xl bg-white p-6 text-ink-soft"><AlertCircle size={19} className="text-amber-600" aria-hidden="true" /> {state.error}</p>
            )}

            {!state.loading && !state.error && state.viajes.length === 0 && (
              <div className="rounded-2xl bg-white p-8 text-center">
                <BusFront size={30} className="mx-auto text-muted" aria-hidden="true" />
                <h2 className="mt-3 text-lg font-bold text-ink">No hay salidas para esta fecha</h2>
                <p className="mt-1 text-ink-soft">Prueba con otra fecha o revisa nuestras <Link to="/#destinos" className="font-semibold text-pine-600 underline">rutas disponibles</Link>.</p>
              </div>
            )}

            {!state.loading && state.viajes.length > 0 && (
              <>
                <p className="mb-3 text-sm text-ink-soft">{state.viajes.length} salidas encontradas</p>
                <ul className="grid gap-3">
                  {state.viajes.map(viaje => {
                    const libres = viaje.asientosDisponibles?.length ?? 0
                    return (
                      <li key={viaje.idViaje} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-4 sm:w-48">
                          <span className="text-3xl font-extrabold tracking-tight text-pine-600">{viaje.horaSalida}</span>
                          {viaje.duracion && <span className="flex items-center gap-1 text-sm text-muted"><Clock3 size={14} aria-hidden="true" /> {viaje.duracion}</span>}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-ink">{BUS_LABEL[viaje.tipoBus] || 'Bus Cruz del Norte'}</p>
                          <p className={`mt-0.5 flex items-center gap-1.5 text-sm ${libres <= 8 ? 'font-semibold text-amber-600' : 'text-ink-soft'}`}>
                            <Users size={14} aria-hidden="true" /> {libres <= 8 ? `¡Últimos ${libres} asientos!` : `${libres} asientos disponibles`}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-5 sm:justify-end">
                          <span className="text-right">
                            <span className="block text-xs text-muted">desde</span>
                            <span className="text-2xl font-extrabold text-amber-600">{formatSoles(viaje.tarifa)}</span>
                          </span>
                          <Link to={`/compra/${viaje.idViaje}`} className="flex h-11 items-center gap-1.5 rounded-lg bg-amber-400 px-5 font-bold text-pine-900 transition hover:bg-amber-500">
                            Elegir asiento <ArrowRight size={16} aria-hidden="true" />
                          </Link>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
