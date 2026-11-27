import { useEffect, useState } from 'react'
import { ArrowLeftRight, CalendarDays, MapPin, Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { getRoutes } from '../services/travelService'
import { todayISO } from '../../../shared/format'

const fieldClass = 'h-12 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-[15px] text-ink outline-none transition focus:border-mint-500 focus:ring-3 focus:ring-mint-200/60'

export function SearchForm({ initial = {}, compact = false }) {
  const navigate = useNavigate()
  const [cities, setCities] = useState([])
  const [origen, setOrigen] = useState(initial.origen || 'Lima')
  const [destino, setDestino] = useState(initial.destino || 'Trujillo')
  const [fecha, setFecha] = useState(initial.fecha || todayISO())
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getRoutes().then(data => active && setCities(data.ciudades || [])).catch(() => active && setCities([]))
    return () => { active = false }
  }, [])

  const swap = () => { setOrigen(destino); setDestino(origen) }

  const submit = event => {
    event.preventDefault()
    if (origen === destino) return setError('El origen y el destino deben ser distintos.')
    if (!fecha || fecha < todayISO()) return setError('Elige una fecha de hoy en adelante.')
    setError('')
    navigate(`/viajes?${new URLSearchParams({ origen, destino, fecha })}`)
  }

  const options = cities.length ? cities : [origen, destino]

  return (
    <form onSubmit={submit} className={`rounded-2xl bg-white p-4 shadow-xl shadow-pine-950/15 ${compact ? '' : 'sm:p-5'}`} aria-label="Buscar pasajes">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_1fr_auto] md:items-end">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-soft uppercase">Origen</span>
          <span className="relative block">
            <MapPin size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-mint-500" aria-hidden="true" />
            <select value={origen} onChange={e => setOrigen(e.target.value)} className={`${fieldClass} appearance-none`}>
              {[...new Set(options)].map(city => <option key={city}>{city}</option>)}
            </select>
          </span>
        </label>
        <button type="button" onClick={swap} className="mx-auto grid size-10 place-items-center rounded-full border border-line text-pine-600 transition hover:bg-mint-50 md:mb-1" aria-label="Intercambiar origen y destino">
          <ArrowLeftRight size={17} className="rotate-90 md:rotate-0" />
        </button>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-soft uppercase">Destino</span>
          <span className="relative block">
            <MapPin size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-amber-600" aria-hidden="true" />
            <select value={destino} onChange={e => setDestino(e.target.value)} className={`${fieldClass} appearance-none`}>
              {[...new Set(options)].map(city => <option key={city}>{city}</option>)}
            </select>
          </span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold tracking-wide text-ink-soft uppercase">Fecha de viaje</span>
          <span className="relative block">
            <CalendarDays size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-mint-500" aria-hidden="true" />
            <input type="date" value={fecha} min={todayISO()} onChange={e => setFecha(e.target.value)} className={fieldClass} />
          </span>
        </label>
        <button type="submit" className="flex h-12 items-center justify-center gap-2 rounded-lg bg-pine-800 px-6 font-bold text-white transition hover:bg-pine-900">
          <Search size={18} aria-hidden="true" /> Buscar
        </button>
      </div>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </form>
  )
}
