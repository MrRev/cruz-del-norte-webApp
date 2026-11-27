import { Header } from '../shared/ui/Header'
import { PageHeader } from '../shared/ui/PageHeader'
import { Benefits, Fleet, HowToBuy } from '../features/landing/components/Services'

export function ServicesPage() {
  return (
    <>
      <Header />
      <main>
        <PageHeader eyebrow="Servicios" title="Viaja cómodo, compra fácil" description="Todo lo que incluye tu viaje con Cruz del Norte, desde la compra en línea hasta el bus en el que viajas." />
        <Benefits />
        <HowToBuy />
        <Fleet />
      </main>
    </>
  )
}
