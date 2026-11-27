import { useState } from 'react'
import { Download, Loader2, TicketCheck } from 'lucide-react'
import { findTicket } from '../services/ticketService'
import { formatLongDate } from '../../../shared/format'
import { SectionHeading } from '../../landing/components/SectionHeading'

const inputClass = 'mt-1.5 h-12 w-full rounded-lg border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-mint-500 focus:ring-3 focus:ring-mint-200/60'

export function TicketLookup() {
  const [codigo, setCodigo] = useState('')
  const [dni, setDni] = useState('')
  const [status, setStatus] = useState({ loading: false, error: '', ticket: null })

  const submit = async event => {
    event.preventDefault()
    if (!/^\d{8}$/.test(dni)) return setStatus({ loading: false, error: 'El DNI debe tener 8 dígitos.', ticket: null })
    setStatus({ loading: true, error: '', ticket: null })
    try {
      setStatus({ loading: false, error: '', ticket: await findTicket({ codigo, dni }) })
    } catch (error) {
      setStatus({ loading: false, error: error.message || 'No se pudo consultar el pasaje.', ticket: null })
    }
  }

  const { ticket } = status

  return (
    <section id="mis-pasajes" className="scroll-mt-20 bg-white py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2 md:items-center">
        <SectionHeading eyebrow="Mis pasajes" title="¿Ya compraste?" description="Consulta el estado de tu pasaje o vuelve a descargarlo con el código que recibiste y el DNI del pasajero." />
        <div className="rounded-2xl border border-line bg-canvas p-5 sm:p-6">
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink-soft">Código del pasaje
              <input required value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="CN-XXXXXX" className={`${inputClass} uppercase`} autoComplete="off" />
            </label>
            <label className="block text-sm font-semibold text-ink-soft">DNI del pasajero
              <input required inputMode="numeric" maxLength={8} value={dni} onChange={e => setDni(e.target.value.replace(/\D/g, ''))} placeholder="8 dígitos" className={inputClass} />
            </label>
            <button type="submit" disabled={status.loading} className="flex h-12 items-center justify-center gap-2 rounded-lg bg-pine-800 font-bold text-white transition hover:bg-pine-900 disabled:opacity-60 sm:col-span-2">
              {status.loading ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Consultando…</> : 'Consultar pasaje'}
            </button>
          </form>
          <div aria-live="polite">
            {status.error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{status.error}</p>}
            {ticket && (
              <div className="mt-4 rounded-xl border border-dashed border-mint-500 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-pine-600"><TicketCheck size={18} aria-hidden="true" /> Pasaje {ticket.estado.toLowerCase()}</div>
                <p className="mt-2 text-lg font-bold text-ink">{ticket.origen} → {ticket.destino}</p>
                <p className="text-sm text-ink-soft first-letter:uppercase">{formatLongDate(ticket.fecha)} · {ticket.horaSalida} · Asiento {ticket.asiento}</p>
                <p className="text-sm text-ink-soft">{ticket.pasajero} · Código <strong className="text-ink">{ticket.codigo}</strong></p>
                {ticket.documentoUrl && <a href={ticket.documentoUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-pine-600"><Download size={15} aria-hidden="true" /> Descargar PDF</a>}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
