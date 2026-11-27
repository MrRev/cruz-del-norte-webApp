import { Armchair, BadgeCheck, CreditCard, FileText, Search, Ticket, Wifi, Plug, Coffee } from 'lucide-react'
import { SectionHeading } from './SectionHeading'

const benefits = [
  { icon: Armchair, title: 'Tu asiento, en vivo', text: 'Ves el mapa del bus actualizado al segundo. Si alguien toma un asiento, lo verás al instante.' },
  { icon: FileText, title: 'Pasaje digital', text: 'Recibe tu pasaje en PDF apenas pagas. Muéstralo en tu celular al abordar.' },
  { icon: CreditCard, title: 'Pago protegido', text: 'Procesamos el pago con una pasarela segura y nunca cobramos dos veces la misma reserva.' },
  { icon: BadgeCheck, title: 'Salidas puntuales', text: 'Flota con mantenimiento programado y control de cada salida desde nuestro centro de operaciones.' },
]

const steps = [
  { icon: Search, title: 'Busca', text: 'Elige origen, destino y fecha.' },
  { icon: Armchair, title: 'Elige tu asiento', text: 'Lo reservamos por unos minutos mientras completas la compra.' },
  { icon: CreditCard, title: 'Paga en línea', text: 'Con tarjeta de débito o crédito.' },
  { icon: Ticket, title: 'Recibe tu pasaje', text: 'Descárgalo y llévalo en tu celular.' },
]

const buses = [
  {
    name: 'Bus de dos pisos', seats: '60 asientos', tag: 'Más elegido',
    detail: 'Primer piso con 12 asientos más amplios (zona preferente). Segundo piso con 48 asientos y vista panorámica.',
    perks: [{ icon: Armchair, text: 'Asientos reclinables' }, { icon: Plug, text: 'Cargador USB' }, { icon: Wifi, text: 'Wi-Fi a bordo' }],
  },
  {
    name: 'Bus de un piso', seats: '48 asientos', tag: 'Rutas cortas',
    detail: 'Ideal para trayectos de pocas horas. Distribución 2+2 con pasillo amplio.',
    perks: [{ icon: Armchair, text: 'Asientos reclinables' }, { icon: Plug, text: 'Cargador USB' }, { icon: Coffee, text: 'Snack de cortesía' }],
  },
]

export function Services() {
  return (
    <>
      <section id="servicios" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Por qué Cruz del Norte" title="Comprar tu pasaje nunca fue tan simple" />
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <span className="grid size-11 place-items-center rounded-xl bg-mint-100 text-pine-600"><Icon size={21} aria-hidden="true" /></span>
                <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-pine-900 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Cómo comprar" title="Tu pasaje en 4 pasos" light center />
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <span className="absolute top-5 right-5 text-4xl font-extrabold text-white/10" aria-hidden="true">{index + 1}</span>
                <Icon size={24} className="text-amber-400" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
                <p className="mt-1.5 text-[15px] text-mint-50/70">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Nuestra flota" title="Elige cómo viajar" description="El tipo de bus se muestra en cada salida antes de comprar." />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {buses.map(bus => (
              <article key={bus.name} className="rounded-2xl border border-line bg-white p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-ink">{bus.name}</h3>
                    <p className="text-sm font-semibold text-pine-600">{bus.seats}</p>
                  </div>
                  <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-600">{bus.tag}</span>
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{bus.detail}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {bus.perks.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-1.5 rounded-lg bg-mint-50 px-3 py-1.5 text-sm text-ink-soft"><Icon size={15} className="text-pine-600" aria-hidden="true" /> {text}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
