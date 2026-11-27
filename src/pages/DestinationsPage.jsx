import { Header } from '../shared/ui/Header'
import { PageHeader } from '../shared/ui/PageHeader'
import { SearchForm } from '../features/travel/components/SearchForm'
import { RouteGrid } from '../features/landing/components/PopularRoutes'
import { UpcomingTrips } from '../features/travel/components/UpcomingTrips'
import { UPCOMING_DAYS } from '../features/travel/services/catalog'

export function DestinationsPage() {
  return (
    <>
      <Header />
      <main className="pb-20">
        <PageHeader eyebrow="Destinos" title="¿A dónde viajas?" description="Elige una ruta para ver sus salidas, revisa las próximas salidas de la semana o busca otra fecha." />
        <div className="mx-auto -mt-8 max-w-6xl px-4 sm:px-6">
          <SearchForm compact />
          <h2 className="mt-14 mb-2 text-2xl font-extrabold tracking-tight text-ink">Todas nuestras rutas</h2>
          <p className="mb-8 text-ink-soft">Precios desde, por persona y en un solo sentido. El precio final depende del asiento y del tipo de bus.</p>
          <RouteGrid />

          <h2 className="mt-16 mb-2 text-2xl font-extrabold tracking-tight text-ink">Próximas salidas</h2>
          <p className="mb-8 text-ink-soft">Todas las salidas con asientos disponibles de los próximos {UPCOMING_DAYS} días.</p>
          <UpcomingTrips />
        </div>
      </main>
    </>
  )
}
