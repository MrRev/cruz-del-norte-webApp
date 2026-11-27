import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router'
import { Logo } from './Logo'

export const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/destinos', label: 'Destinos' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/ayuda', label: 'Ayuda' },
]

export function Header({ overlay = false }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  // Cierra el menú móvil en cualquier navegación (atrás/adelante incluidos)…
  useEffect(() => { setOpen(false) }, [location.key])
  // …y también al tocar un enlace aunque lleve a la misma página.
  const close = () => setOpen(false)

  const light = overlay && !open
  const desktopLink = ({ isActive }) => {
    const base = 'relative py-1 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:transition'
    if (light) return `${base} ${isActive ? 'text-white after:bg-amber-400' : 'text-mint-50/80 hover:text-white after:bg-transparent'}`
    return `${base} ${isActive ? 'text-ink after:bg-amber-400' : 'text-ink-soft hover:text-ink after:bg-transparent'}`
  }

  return (
    <header className={`${overlay ? 'absolute inset-x-0 top-0' : 'sticky top-0 border-b border-line bg-white/95 backdrop-blur'} z-30 ${open ? 'bg-white' : ''}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo light={light} />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
          {NAV_LINKS.map(link => (
            <NavLink key={link.to} to={link.to} end={link.end} className={desktopLink}>{link.label}</NavLink>
          ))}
          <Link to="/#buscar" className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-pine-900 transition hover:bg-amber-500">Comprar pasaje</Link>
        </nav>
        <button type="button" className={`rounded-lg p-2 md:hidden ${light ? 'text-white' : 'text-ink'}`} onClick={() => setOpen(v => !v)} aria-expanded={open} aria-controls="menu-movil" aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <nav id="menu-movil" className="border-t border-line bg-white px-4 pb-4 md:hidden" aria-label="Principal móvil">
          {NAV_LINKS.map(link => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={close} className={({ isActive }) => `block border-b border-line py-3 text-[15px] font-medium ${isActive ? 'text-pine-600' : 'text-ink'}`}>{link.label}</NavLink>
          ))}
          <Link to="/#buscar" onClick={close} className="mt-4 block rounded-lg bg-amber-400 py-3 text-center font-bold text-pine-900">Comprar pasaje</Link>
        </nav>
      )}
    </header>
  )
}
