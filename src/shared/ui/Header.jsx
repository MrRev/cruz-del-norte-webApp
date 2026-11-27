import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router'
import { Logo } from './Logo'

const links = [
  { href: '/#destinos', label: 'Destinos' },
  { href: '/#servicios', label: 'Servicios' },
  { href: '/#mis-pasajes', label: 'Mis pasajes' },
  { href: '/#ayuda', label: 'Ayuda' },
]

export function Header({ overlay = false }) {
  const [open, setOpen] = useState(false)
  const light = overlay && !open
  return (
    <header className={`${overlay ? 'absolute inset-x-0 top-0 z-30' : 'sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur'} ${open ? 'bg-white' : ''}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo light={light} />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
          {links.map(link => (
            <Link key={link.href} to={link.href} className={`text-sm font-medium transition-colors ${light ? 'text-mint-50/85 hover:text-white' : 'text-ink-soft hover:text-ink'}`}>{link.label}</Link>
          ))}
          <Link to="/#buscar" className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-pine-900 transition hover:bg-amber-500">Comprar pasaje</Link>
        </nav>
        <button type="button" className={`rounded-lg p-2 md:hidden ${light ? 'text-white' : 'text-ink'}`} onClick={() => setOpen(v => !v)} aria-expanded={open} aria-controls="menu-movil" aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <nav id="menu-movil" className="border-t border-line bg-white px-4 pb-4 md:hidden" aria-label="Principal móvil">
          {links.map(link => (
            <Link key={link.href} to={link.href} onClick={() => setOpen(false)} className="block border-b border-line py-3 text-[15px] font-medium text-ink">{link.label}</Link>
          ))}
          <Link to="/#buscar" onClick={() => setOpen(false)} className="mt-4 block rounded-lg bg-amber-400 py-3 text-center font-bold text-pine-900">Comprar pasaje</Link>
        </nav>
      )}
    </header>
  )
}
