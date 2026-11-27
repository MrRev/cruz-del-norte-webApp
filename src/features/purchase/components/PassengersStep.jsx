import { useRef, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { DNI_LOOKUP_ENABLED, lookupDni } from '../services/dniService'

const inputClass = 'mt-1.5 h-11 w-full rounded-lg border bg-white px-3 text-[15px] text-ink outline-none focus:ring-3 focus:ring-mint-200/60'

const validate = p => {
  const errors = {}
  if (!/^\d{8}$/.test(p.dni || '')) errors.dni = 'Ingresa 8 dígitos.'
  if (!p.nombres?.trim()) errors.nombres = 'Ingresa los nombres.'
  if (!p.apellidos?.trim()) errors.apellidos = 'Ingresa los apellidos.'
  return errors
}

export function PassengersStep({ seats, initial, busy, onBack, onSubmit }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(seats.map(s => [s.idReserva, initial[s.idReserva] || { dni: '', nombres: '', apellidos: '' }])))
  const [errors, setErrors] = useState({})
  // Estado de la búsqueda por DNI de cada pasajero: { status: 'buscando' | 'ok' | 'error', message }
  const [lookup, setLookup] = useState({})
  // Últimos valores puestos automáticamente: solo esos se reemplazan en una nueva
  // búsqueda; lo que el cliente escribió a mano nunca se pisa.
  const autofilled = useRef({})
  const latestDni = useRef({})

  const update = (id, field, value) => {
    setValues(v => ({ ...v, [id]: { ...v[id], [field]: value } }))
    setErrors(e => ({ ...e, [id]: { ...e[id], [field]: '' } }))
    if (field === 'dni') onDniChange(id, value)
  }

  const onDniChange = async (id, dni) => {
    latestDni.current[id] = dni
    if (!DNI_LOOKUP_ENABLED || dni.length !== 8) { setLookup(l => ({ ...l, [id]: undefined })); return }
    setLookup(l => ({ ...l, [id]: { status: 'buscando' } }))
    try {
      const person = await lookupDni(dni)
      if (latestDni.current[id] !== dni) return // el cliente cambió el DNI mientras se buscaba
      setValues(v => {
        const current = v[id]
        const prev = autofilled.current[id] || {}
        const fill = field => (!current[field].trim() || current[field] === prev[field]) && person[field] ? person[field] : current[field]
        const next = { ...current, nombres: fill('nombres'), apellidos: fill('apellidos') }
        autofilled.current[id] = { nombres: next.nombres, apellidos: next.apellidos }
        return { ...v, [id]: next }
      })
      setErrors(e => ({ ...e, [id]: { ...e[id], nombres: '', apellidos: '' } }))
      setLookup(l => ({ ...l, [id]: { status: 'ok' } }))
    } catch (error) {
      if (latestDni.current[id] !== dni) return
      setLookup(l => ({ ...l, [id]: { status: 'error', message: error.message } }))
    }
  }

  const submit = event => {
    event.preventDefault()
    const found = Object.fromEntries(seats.map(s => [s.idReserva, validate(values[s.idReserva])]))
    // Una persona no puede ocupar dos asientos en la misma compra.
    const seen = new Set()
    for (const s of seats) {
      const dni = values[s.idReserva].dni
      if (found[s.idReserva].dni || !dni) continue
      if (seen.has(dni)) found[s.idReserva].dni = 'Este DNI ya está en otro asiento.'
      seen.add(dni)
    }
    setErrors(found)
    if (Object.values(found).some(e => Object.keys(e).length)) return
    onSubmit(Object.fromEntries(seats.map(s => [s.idReserva, {
      dni: values[s.idReserva].dni, nombres: values[s.idReserva].nombres.trim(), apellidos: values[s.idReserva].apellidos.trim(),
    }])))
  }

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="text-xl font-bold text-ink">Datos de los pasajeros</h2>
      <p className="mt-1 text-sm text-ink-soft">Deben coincidir con el DNI que presentarán al abordar.{DNI_LOOKUP_ENABLED && ' Al ingresar el DNI completamos nombres y apellidos.'}</p>
      <div className="mt-6 space-y-5">
        {seats.map((seat, index) => {
          const v = values[seat.idReserva]
          const e = errors[seat.idReserva] || {}
          const field = (name, label, props = {}) => (
            <label className="block text-sm font-semibold text-ink-soft">{label}
              <input value={v[name]} onChange={ev => update(seat.idReserva, name, props.digits ? ev.target.value.replace(/\D/g, '') : ev.target.value)}
                aria-invalid={Boolean(e[name])} className={`${inputClass} ${e[name] ? 'border-red-400' : 'border-line focus:border-mint-500'}`} {...props.input} />
              {e[name] && <span className="mt-1 block text-xs font-medium text-red-600">{e[name]}</span>}
            </label>
          )
          return (
            <fieldset key={seat.idReserva} className="rounded-xl border border-line p-4 sm:p-5">
              <legend className="px-1 text-sm font-bold text-pine-600">Pasajero {index + 1} · Asiento {seat.numero} (piso {seat.piso})</legend>
              <div className="grid gap-4 sm:grid-cols-[0.8fr_1fr_1fr]">
                {field('dni', 'DNI', { digits: true, input: { inputMode: 'numeric', maxLength: 8, placeholder: '8 dígitos', autoComplete: 'off' } })}
                {field('nombres', 'Nombres', { input: { autoComplete: index === 0 ? 'given-name' : 'off' } })}
                {field('apellidos', 'Apellidos', { input: { autoComplete: index === 0 ? 'family-name' : 'off' } })}
              </div>
              <div aria-live="polite" className="min-h-0">
                {lookup[seat.idReserva]?.status === 'buscando' && <p className="mt-3 flex items-center gap-1.5 text-sm text-pine-600"><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Buscando datos del DNI…</p>}
                {lookup[seat.idReserva]?.status === 'ok' && <p className="mt-3 flex items-center gap-1.5 text-sm text-pine-600"><CheckCircle2 size={15} aria-hidden="true" /> Datos completados. Revísalos antes de continuar.</p>}
                {lookup[seat.idReserva]?.status === 'error' && <p className="mt-3 text-sm text-amber-600">{lookup[seat.idReserva].message}</p>}
              </div>
            </fieldset>
          )
        })}
      </div>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" onClick={onBack} disabled={busy} className="h-12 rounded-lg px-5 font-semibold text-ink-soft hover:bg-mint-50">← Cambiar asientos</button>
        <button type="submit" disabled={busy} className="h-12 rounded-lg bg-pine-800 px-6 font-bold text-white transition hover:bg-pine-900 disabled:opacity-60">
          {busy ? 'Guardando…' : 'Continuar al pago'}
        </button>
      </div>
    </form>
  )
}
