import { useEffect, useState } from 'react'
import { ArrowRight, Clock3 } from 'lucide-react'
import { Link } from 'react-router'
import { getRoutes } from '../../travel/services/travelService'
import { formatSoles, todayISO } from '../../../shared/format'
import { SectionHeading } from './SectionHeading'

export function PopularRoutes() {
  const [routes, setRoutes] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    getRoutes().then(data => active && setRoutes(data.rutas || [])).catch(() => active && setError(true))
    return () => { active = false }
  }, [])

  return (
    <section id="destinos" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Destinos" title="Rutas más elegidas" description="Precios desde, por persona y en un solo sentido. El precio final depende del asiento y del bus." />
        {error && <p className="mt-8 rounded-xl bg-white p-6 text-ink-soft">No pudimos cargar las rutas en este momento. Usa el buscador de arriba.</p>}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes === null && !error && Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-white" aria-hidden="true" />
          ))}
          {routes?.map(route => (
            <Link
              key={`${route.origen}-${route.destino}`}
              to={`/viajes?${new URLSearchParams({ origen: route.origen, destino: route.destino, fecha: todayISO() })}`}
              className="group rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-mint-500 hover:shadow-lg hover:shadow-pine-900/5"
            >
              <p className="text-xs font-semibold text-muted">{route.origen}</p>
              <p className="mt-0.5 flex items-center gap-2 text-xl font-bold tracking-tight text-ink">
                {route.destino}
              </p>
              <div className="mt-5 flex items-end justify-between">
                <span className="flex items-center gap-1.5 text-sm text-ink-soft"><Clock3 size={15} aria-hidden="true" /> {route.duracion} · {route.salidasDiarias} salidas</span>
                <span className="text-right">
                  <span className="block text-[11px] text-muted">desde</span>
                  <span className="text-lg font-extrabold text-amber-600">{formatSoles(route.desde)}</span>
                </span>
              </div>
              <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-pine-600">
                Ver salidas <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
