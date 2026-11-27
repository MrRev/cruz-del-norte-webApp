import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Loader2, RotateCcw } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'
import { Header } from '../shared/ui/Header'
import { InfoPage } from './InfoPage'
import { USE_MOCKS } from '../shared/api/http'
import { getSeatMap } from '../features/travel/services/travelService'
import { MAX_SEATS, usePurchase } from '../features/purchase/hooks/usePurchase'
import { SeatMap } from '../features/purchase/components/SeatMap'
import { PassengersStep } from '../features/purchase/components/PassengersStep'
import { PaymentStep } from '../features/purchase/components/PaymentStep'
import { Confirmation } from '../features/purchase/components/Confirmation'
import { PurchaseSummary, Stepper } from '../features/purchase/components/PurchaseSummary'

const MAP_REFRESH_MS = 15_000

export function PurchasePage() {
  if (USE_MOCKS) {
    return (
      <InfoPage title="Compra en línea">
        <p>La web está usando datos de ejemplo (<code>VITE_USE_MOCKS=true</code>), así que no puede reservar ni cobrar.</p>
        <p>Para probar la compra completa, conecta el backend: revisa la sección "Conectar con el backend" del README.</p>
      </InfoPage>
    )
  }
  return <Purchase />
}

function Purchase() {
  const { idViaje } = useParams()
  const [params] = useSearchParams()
  const trip = { origen: params.get('origen') || '', destino: params.get('destino') || '', fecha: params.get('fecha') || '', hora: params.get('hora') || '' }
  const purchase = usePurchase(idViaje)
  const { state, busy, error, secondsLeft, expired, total } = purchase

  const [map, setMap] = useState(null)
  const [mapError, setMapError] = useState('')

  const loadMap = useCallback(async () => {
    try { setMap(await getSeatMap(idViaje)); setMapError('') } catch (e) { setMapError(e.message || 'No pudimos cargar el mapa de asientos.') }
  }, [idViaje])

  // Mapa de asientos: carga inicial y refresco periódico para ver lo que eligen otros.
  useEffect(() => {
    if (state.step !== 'asientos') return undefined
    loadMap()
    const timer = setInterval(loadMap, MAP_REFRESH_MS)
    return () => clearInterval(timer)
  }, [loadMap, state.step])

  useEffect(() => { document.title = `Compra ${trip.origen} → ${trip.destino} · Cruz del Norte` }, [trip.origen, trip.destino])
  // Cada paso empieza arriba (en celular el botón "Continuar" queda al fondo).
  useEffect(() => { window.scrollTo(0, 0) }, [state.step])

  const toggleSeat = async seat => { await purchase.toggleSeat(seat); loadMap() }
  const mine = new Set(state.seats.map(s => s.idAsiento))

  return (
    <>
      <Header />
      <main className="pb-20">
        <div className="bg-pine-900 pt-8 pb-14">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-extrabold tracking-[0.16em] text-amber-400 uppercase">Compra</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{trip.origen} → {trip.destino}</h1>
            </div>
            <Stepper step={state.step} />
          </div>
        </div>

        <div className="mx-auto -mt-8 grid max-w-6xl items-start gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-xl shadow-pine-950/10 sm:p-7">
            {error && <p role="alert" className="mb-5 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" /> {error}</p>}

            {expired ? (
              <div className="py-6 text-center">
                <h2 className="text-xl font-bold text-ink">Tu reserva venció</h2>
                <p className="mt-1 text-ink-soft">Los asientos se liberaron para otros pasajeros. Puedes elegirlos de nuevo si siguen libres.</p>
                <button type="button" onClick={() => purchase.reset({ release: false })} className="mt-5 inline-flex h-12 items-center gap-2 rounded-lg bg-pine-800 px-6 font-bold text-white hover:bg-pine-900">
                  <RotateCcw size={17} aria-hidden="true" /> Elegir asientos otra vez
                </button>
              </div>
            ) : state.step === 'asientos' ? (
              <div>
                <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-ink">Elige tus asientos</h2>
                    <p className="text-sm text-ink-soft">Hasta {MAX_SEATS} por compra. Al tocar un asiento lo reservamos para ti.</p>
                  </div>
                  {busy && <span className="flex items-center gap-1.5 text-sm text-pine-600"><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Actualizando…</span>}
                </div>
                {mapError && <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{mapError}</p>}
                {!map && !mapError && <div className="mx-auto h-96 max-w-xs animate-pulse rounded-[28px] bg-canvas" />}
                {map && <SeatMap map={map} mine={mine} onToggle={toggleSeat} disabled={busy} />}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Link to={`/viajes?${new URLSearchParams({ origen: trip.origen, destino: trip.destino, fecha: trip.fecha })}`}
                    onClick={() => purchase.reset()} className="flex h-12 items-center justify-center rounded-lg px-5 font-semibold text-ink-soft hover:bg-mint-50">← Otras salidas</Link>
                  <button type="button" disabled={!state.seats.length || busy} onClick={() => purchase.goTo('pasajeros')}
                    className="h-12 rounded-lg bg-pine-800 px-6 font-bold text-white transition hover:bg-pine-900 disabled:opacity-50">
                    Continuar{state.seats.length ? ` con ${state.seats.length} asiento${state.seats.length > 1 ? 's' : ''}` : ''}
                  </button>
                </div>
              </div>
            ) : state.step === 'pasajeros' ? (
              <PassengersStep seats={state.seats} initial={state.passengers} busy={busy} onBack={() => purchase.goTo('asientos')} onSubmit={purchase.savePassengers} />
            ) : state.step === 'pago' ? (
              <PaymentStep seats={state.seats} passengers={state.passengers} total={total} busy={busy} onBack={() => purchase.goTo('pasajeros')} onPay={purchase.payAndIssue} />
            ) : (
              <Confirmation trip={trip} seats={state.seats} passengers={state.passengers} tickets={state.tickets} onNewPurchase={() => purchase.reset({ release: false })} />
            )}
          </section>

          {state.step !== 'listo' && (
            <PurchaseSummary trip={trip} seats={state.seats} total={total} secondsLeft={secondsLeft} showTimer={state.seats.length > 0 && !expired} />
          )}
        </div>
      </main>
    </>
  )
}
