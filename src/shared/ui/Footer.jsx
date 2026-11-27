import { BookOpenText, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router'
import { Logo } from './Logo'
import { CONTACT } from '../contact'

export function Footer() {
  return (
    <footer className="bg-pine-950 text-mint-50/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-mint-50/60">Conectamos Lima con el norte del Perú. Compra en línea, elige tu asiento y viaja con tu pasaje digital.</p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Viaja</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/#buscar" className="hover:text-white">Comprar pasaje</Link></li>
            <li><Link to="/destinos" className="hover:text-white">Destinos</Link></li>
            <li><Link to="/servicios" className="hover:text-white">Servicios</Link></li>
            <li><Link to="/ayuda" className="hover:text-white">Preguntas frecuentes</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Legal</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/terminos" className="hover:text-white">Términos y condiciones</Link></li>
            <li><Link to="/privacidad" className="hover:text-white">Política de privacidad</Link></li>
          </ul>
          <Link to="/libro-de-reclamaciones" className="mt-5 inline-flex items-center gap-2 rounded-lg border border-mint-50/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/5">
            <BookOpenText size={17} aria-hidden="true" /> Libro de Reclamaciones
          </Link>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Contacto</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {CONTACT.phone}</li>
            <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {CONTACT.email}</li>
            <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {CONTACT.agencies[0].address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-mint-50/45 sm:px-6">© {new Date().getFullYear()} Cruz del Norte. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
