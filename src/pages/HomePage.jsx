import { ArrowRight, BusFront, CircleHelp, TicketCheck } from 'lucide-react'
import { Link } from 'react-router'
import { Header } from '../shared/ui/Header'
import { Hero } from '../features/landing/components/Hero'
import { RouteGrid } from '../features/landing/components/PopularRoutes'
import { HowToBuy } from '../features/landing/components/Services'
import { SectionHeading } from '../features/landing/components/SectionHeading'

const shortcuts = [
  { to: '/servicios', icon: BusFront, title: 'Servicios y flota', text: 'Conoce nuestros buses de uno y dos pisos y todo lo que incluye tu viaje.' },
  { to: '/mis-pasajes', icon: TicketCheck, title: 'Mis pasajes', text: 'Consulta el estado de tu pasaje o vuelve a descargarlo con tu código y DNI.' },
  { to: '/ayuda', icon: CircleHelp, title: 'Ayuda', text: 'Equipaje, menores de edad, cambios y devoluciones. Y cómo contactarnos.' },
]

export function HomePage() {
  return (
    <>
      <Header overlay />
      <main>
        <Hero />

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading eyebrow="Destinos" title="Rutas más elegidas" description="Precios desde, por persona y en un solo sentido." />
              <Link to="/destinos" className="flex shrink-0 items-center gap-1.5 font-semibold text-pine-600 hover:text-pine-800">Ver todos los destinos <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
            <div className="mt-10"><RouteGrid limit={3} /></div>
          </div>
        </section>

        <HowToBuy />

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading eyebrow="Explora" title="Todo para tu viaje" />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {shortcuts.map(({ to, icon: Icon, title, text }) => (
                <Link key={to} to={to} className="group rounded-2xl border border-line bg-white p-6 transition hover:border-mint-500 hover:shadow-lg hover:shadow-pine-900/5">
                  <span className="grid size-11 place-items-center rounded-xl bg-mint-100 text-pine-600"><Icon size={21} aria-hidden="true" /></span>
                  <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{text}</p>
                  <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-pine-600">Ir a {title.toLowerCase()} <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden="true" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
