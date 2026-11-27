export function SectionHeading({ eyebrow, title, description, center = false, light = false }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className={`text-xs font-extrabold tracking-[0.16em] uppercase ${light ? 'text-amber-400' : 'text-pine-600'}`}>{eyebrow}</p>
      <h2 className={`mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl ${light ? 'text-white' : 'text-ink'}`}>{title}</h2>
      {description && <p className={`mt-3 text-base leading-relaxed ${light ? 'text-mint-50/70' : 'text-ink-soft'}`}>{description}</p>}
    </div>
  )
}
