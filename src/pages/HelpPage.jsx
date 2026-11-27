import { BookOpenText, Clock3, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router'
import { Header } from '../shared/ui/Header'
import { PageHeader } from '../shared/ui/PageHeader'
import { FAQ_GROUPS, FaqList } from '../features/landing/components/Faq'
import { CONTACT } from '../shared/contact'

export function HelpPage() {
  return (
    <>
      <Header />
      <main className="pb-20">
        <PageHeader eyebrow="Ayuda" title="¿En qué te ayudamos?" description="Respuestas a las dudas más comunes sobre compra, equipaje, menores de edad, cambios y devoluciones." />
        <div className="mx-auto mt-12 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-10">
            {FAQ_GROUPS.map(group => (
              <section key={group.title}>
                <h2 className="mb-4 text-xl font-extrabold tracking-tight text-ink">{group.title}</h2>
                <FaqList items={group.items} />
              </section>
            ))}
          </div>

          <aside className="h-max space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl bg-pine-900 p-6 text-mint-50/85">
              <h2 className="text-lg font-bold text-white">¿No encontraste tu respuesta?</h2>
              <p className="mt-1 text-sm text-mint-50/70">Nuestro equipo te atiende por teléfono, WhatsApp o correo.</p>
              <ul className="mt-5 space-y-3.5 text-[15px]">
                <li><a href={CONTACT.phoneHref} className="flex items-center gap-2.5 hover:text-white"><Phone size={17} className="text-amber-400" aria-hidden="true" /> {CONTACT.phone}</a></li>
                <li><a href={CONTACT.whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 hover:text-white"><MessageCircle size={17} className="text-amber-400" aria-hidden="true" /> WhatsApp {CONTACT.whatsapp}</a></li>
                <li><a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2.5 hover:text-white"><Mail size={17} className="text-amber-400" aria-hidden="true" /> {CONTACT.email}</a></li>
                <li className="flex items-center gap-2.5"><Clock3 size={17} className="text-amber-400" aria-hidden="true" /> {CONTACT.hours}</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-lg font-bold text-ink">Agencias</h2>
              <ul className="mt-4 space-y-3">
                {CONTACT.agencies.map(agency => (
                  <li key={agency.city} className="flex gap-2.5 text-[15px] text-ink-soft"><MapPin size={17} className="mt-0.5 shrink-0 text-pine-600" aria-hidden="true" /><span><strong className="text-ink">{agency.city}</strong><br />{agency.address}</span></li>
                ))}
              </ul>
            </div>
            <Link to="/libro-de-reclamaciones" className="flex items-center gap-2.5 rounded-2xl border border-line bg-white p-5 font-semibold text-ink hover:border-mint-500">
              <BookOpenText size={20} className="text-pine-600" aria-hidden="true" /> Libro de Reclamaciones
            </Link>
          </aside>
        </div>
      </main>
    </>
  )
}
