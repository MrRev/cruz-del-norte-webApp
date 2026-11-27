import { ShieldCheck, Ticket, Armchair } from 'lucide-react'
import { SearchForm } from '../../travel/components/SearchForm'

const highlights = [
  { icon: Armchair, text: 'Eliges tu asiento en tiempo real' },
  { icon: Ticket, text: 'Pasaje digital al instante' },
  { icon: ShieldCheck, text: 'Pago seguro en línea' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-pine-900 pt-28 pb-16 sm:pt-32 md:pb-24">
      {/* Carretera decorativa */}
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-56 w-full text-pine-800" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 220 L560 40 Q720 0 880 40 L1440 220 Z" fill="currentColor" />
        <path d="M720 30 L720 220" stroke="#f2b84b" strokeWidth="5" strokeDasharray="26 22" opacity=".55" />
      </svg>
      <div className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full border border-mint-200/10 shadow-[0_0_0_60px_rgba(188,232,221,.04),0_0_0_120px_rgba(188,232,221,.03)]" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-mint-200/20 bg-white/5 px-3 py-1 text-xs font-semibold text-mint-200">
          <span className="size-1.5 rounded-full bg-mint-400" /> Venta en línea disponible las 24 horas
        </p>
        <h1 className="max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          Viaja por el norte del Perú <span className="text-amber-400">con comodidad</span> y seguridad
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-mint-50/75 sm:text-lg">
          Compra tu pasaje en minutos, elige tu asiento favorito y recíbelo en tu correo. Sin colas en el terminal.
        </p>

        <div id="buscar" className="mt-9 scroll-mt-24">
          <SearchForm />
        </div>

        <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
          {highlights.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2 text-sm text-mint-50/80">
              <Icon size={17} className="text-amber-400" aria-hidden="true" /> {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
