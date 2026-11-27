import { useEffect } from 'react'

// Encabezado común de las páginas internas: franja oscura con título y bajada.
export function PageHeader({ eyebrow, title, description, children }) {
  // La pestaña muestra el nombre de la sección (p. ej. "Destinos"), no la pregunta del título.
  const tabTitle = eyebrow || title
  useEffect(() => { document.title = `${tabTitle} · Cruz del Norte` }, [tabTitle])
  return (
    <div className="bg-pine-900 pt-10 pb-14 sm:pt-14 sm:pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {eyebrow && <p className="text-xs font-extrabold tracking-[0.16em] text-amber-400 uppercase">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-base leading-relaxed text-mint-50/75 sm:text-lg">{description}</p>}
        {children}
      </div>
    </div>
  )
}
