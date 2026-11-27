import { useEffect, useState } from 'react'
import { ArrowRight, Clock3 } from 'lucide-react'
import { Link } from 'react-router'
import { getRoutes } from '../../travel/services/travelService'
import { formatShortDate, formatSoles, todayISO } from '../../../shared/format'

// Tarjetas de rutas. `limit` recorta la lista (la portada muestra solo unas
// cuantas; la página de Destinos las muestra todas).
export function RouteGrid({ limit }) {
  const [routes, setRoutes] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    getRoutes().then(data => active && setRoutes(data.rutas || [])).catch(() => active && setError(true))
    return () => { active = false }
  }, [])

  if (error) return <p className="rounded-xl bg-white p-6 text-ink-soft">No pudimos cargar las rutas en este momento. Usa el buscador para consultar salidas.</p>

  const visible = routes ? routes.slice(0, limit ?? routes.length) : null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible === null && Array.from({ length: limit ?? 6 }, (_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl bg-white" aria-hidden="true" />
      ))}
      {visible?.map(route => (
        <Link
          key={`${route.origen}-${route.destino}`}
          // Abre la búsqueda en la fecha de la próxima salida, para no caer en un día sin viajes.
          to={`/viajes?${new URLSearchParams({ origen: route.origen, destino: route.destino, fecha: route.proxima?.fecha || todayISO() })}`}
          className="group rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-mint-500 hover:shadow-lg hover:shadow-pine-900/5"
        >
          <p className="text-xs font-semibold text-muted">{route.origen}</p>
          <p className="mt-0.5 text-xl font-bold tracking-tight text-ink">{route.destino}</p>
          <div className="mt-5 flex items-end justify-between">
            <span className="text-sm text-ink-soft">
              <span className="flex items-center gap-1.5"><Clock3 size={15} aria-hidden="true" /> {route.duracion}</span>
              <span className="mt-0.5 block">{route.salidasDiarias != null ? `${route.salidasDiarias} salidas diarias` : route.salidasSemana ? `${route.salidasSemana} salidas esta semana` : 'Sin salidas esta semana'}</span>
              {route.proxima && <span className="mt-0.5 block text-pine-600">Próxima: {formatShortDate(route.proxima.fecha)} · {route.proxima.hora}</span>}
            </span>
            {route.desde != null && (
              <span className="text-right">
                <span className="block text-[11px] text-muted">desde</span>
                <span className="text-lg font-extrabold text-amber-600">{formatSoles(route.desde)}</span>
              </span>
            )}
          </div>
          <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-pine-600">
            Ver salidas <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  )
}
