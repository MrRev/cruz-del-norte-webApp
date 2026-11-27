import { Header } from '../shared/ui/Header'
import { Hero } from '../features/landing/components/Hero'
import { PopularRoutes } from '../features/landing/components/PopularRoutes'
import { Services } from '../features/landing/components/Services'
import { TicketLookup } from '../features/tickets/components/TicketLookup'
import { Faq } from '../features/landing/components/Faq'

export function HomePage() {
  return (
    <>
      <Header overlay />
      <main>
        <Hero />
        <PopularRoutes />
        <Services />
        <TicketLookup />
        <Faq />
      </main>
    </>
  )
}
