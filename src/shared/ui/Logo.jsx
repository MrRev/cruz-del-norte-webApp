import { BusFront } from 'lucide-react'
import { Link } from 'react-router'

export function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Cruz del Norte, inicio">
      <span className="grid size-9 place-items-center rounded-xl bg-amber-400 text-pine-900">
        <BusFront size={20} strokeWidth={2.3} aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <strong className={`block text-[15px] tracking-tight ${light ? 'text-white' : 'text-ink'}`}>Cruz del Norte</strong>
        <span className={`block text-[11px] ${light ? 'text-mint-200/80' : 'text-muted'}`}>Transporte interprovincial</span>
      </span>
    </Link>
  )
}
