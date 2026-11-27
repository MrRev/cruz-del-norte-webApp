import { useEffect } from 'react'
import { ArrowLeft, Construction } from 'lucide-react'
import { Link } from 'react-router'
import { Header } from '../shared/ui/Header'

// Página genérica para secciones que aún no tienen contenido definitivo
// (legales, compra en línea). Evita enlaces rotos mientras se completan.
export function InfoPage({ title, children }) {
  useEffect(() => { document.title = `${title} · Cruz del Norte` }, [title])
  return (
    <>
      <Header />
      <main className="mx-auto min-h-[60vh] max-w-3xl px-4 py-16 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-pine-600"><ArrowLeft size={16} aria-hidden="true" /> Volver al inicio</Link>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
        <div className="mt-6 flex gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-5 text-ink-soft">
          <Construction size={22} className="shrink-0 text-amber-600" aria-hidden="true" />
          <div className="space-y-2 text-[15px] leading-relaxed">{children}</div>
        </div>
      </main>
    </>
  )
}
