import { Header } from '../shared/ui/Header'
import { PageHeader } from '../shared/ui/PageHeader'
import { SearchForm } from '../features/travel/components/SearchForm'
import { RouteGrid } from '../features/landing/components/PopularRoutes'

export function DestinationsPage() {
  return (
    <>
      <Header />
      <main className="pb-20">
        <PageHeader eyebrow="Destinos" title="¿A dónde viajas?" description="Conectamos Lima con las principales ciudades del norte del Perú. Elige una ruta para ver sus salidas de hoy o busca otra fecha." />
        <div className="mx-auto -mt-8 max-w-6xl px-4 sm:px-6">
          <SearchForm compact />
          <h2 className="mt-14 mb-2 text-2xl font-extrabold tracking-tight text-ink">Todas nuestras rutas</h2>
          <p className="mb-8 text-ink-soft">Precios desde, por persona y en un solo sentido. El precio final depende del asiento y del tipo de bus.</p>
          <RouteGrid />
        </div>
      </main>
    </>
  )
}
