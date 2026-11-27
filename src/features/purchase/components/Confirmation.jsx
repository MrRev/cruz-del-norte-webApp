import { CheckCircle2, Download } from 'lucide-react'
import { Link } from 'react-router'
import { formatLongDate } from '../../../shared/format'

export function Confirmation({ trip, seats, passengers, tickets, onNewPurchase }) {
  return (
    <div className="text-center">
      <CheckCircle2 size={52} className="mx-auto text-mint-500" aria-hidden="true" />
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">¡Compra confirmada!</h2>
      <p className="mt-1 text-ink-soft">
        {trip.origen} → {trip.destino}
        {trip.fecha && <> · <span className="first-letter:uppercase">{formatLongDate(trip.fecha)}</span></>}
        {trip.hora && <> · {trip.hora}</>}
      </p>

      <ul className="mt-6 space-y-3 text-left">
        {seats.map(seat => {
          const ticket = tickets[seat.idReserva]
          const p = passengers[seat.idReserva]
          return (
            <li key={seat.idReserva} className="flex flex-col gap-3 rounded-xl border border-dashed border-mint-500 bg-mint-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-pine-600 uppercase">Pasaje {ticket?.codigo}</p>
                <p className="font-bold text-ink">{p?.nombres} {p?.apellidos}</p>
                <p className="text-sm text-ink-soft">Asiento {seat.numero}, piso {seat.piso}</p>
              </div>
              {ticket?.documentoUrl && (
                <a href={ticket.documentoUrl} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-lg bg-pine-800 px-4 font-bold text-white hover:bg-pine-900">
                  <Download size={17} aria-hidden="true" /> Descargar PDF
                </a>
              )}
            </li>
          )
        })}
      </ul>

      <p className="mt-5 text-sm text-ink-soft">Presenta el PDF en tu celular y tu DNI al abordar. Llega al terminal 30 minutos antes.</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={onNewPurchase} className="h-12 rounded-lg px-5 font-semibold text-pine-700 hover:bg-mint-50">Comprar otro pasaje</button>
        <Link to="/" className="flex h-12 items-center justify-center rounded-lg bg-amber-400 px-6 font-bold text-pine-900 hover:bg-amber-500">Volver al inicio</Link>
      </div>
    </div>
  )
}
