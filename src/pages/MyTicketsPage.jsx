import { Link } from 'react-router'
import { Header } from '../shared/ui/Header'
import { PageHeader } from '../shared/ui/PageHeader'
import { TicketLookup } from '../features/tickets/components/TicketLookup'

const tips = [
  { title: '¿No encuentras tu código?', text: 'Revisa la carpeta de spam o promociones de tu correo. El asunto empieza con "Tu pasaje Cruz del Norte".' },
  { title: 'Al abordar', text: 'Muestra el PDF en tu celular y tu DNI. Llega al terminal al menos 30 minutos antes de la salida.' },
  { title: '¿Necesitas cambiarlo?', text: 'Los cambios y devoluciones dependen de la tarifa.' },
]

export function MyTicketsPage() {
  return (
    <>
      <Header />
      <main className="pb-20">
        <PageHeader eyebrow="Mis pasajes" title="¿Ya compraste?" description="Consulta el estado de tu pasaje o vuelve a descargarlo con el código que recibiste y el DNI del pasajero." />
        <div className="mx-auto -mt-8 grid max-w-6xl items-start gap-8 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
          <TicketLookup />
          <aside className="space-y-3 lg:mt-8">
            {tips.map(tip => (
              <div key={tip.title} className="rounded-2xl border border-line bg-white p-5">
                <h2 className="font-bold text-ink">{tip.title}</h2>
                <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">
                  {tip.text}{tip.title === '¿Necesitas cambiarlo?' && <> Revisa <Link to="/ayuda" className="font-semibold text-pine-600 underline">Ayuda</Link>.</>}
                </p>
              </div>
            ))}
          </aside>
        </div>
      </main>
    </>
  )
}
