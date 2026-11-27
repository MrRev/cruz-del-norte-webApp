import { useState } from 'react'

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

  const update = (id, field, value) => {
    setValues(v => ({ ...v, [id]: { ...v[id], [field]: value } }))
    setErrors(e => ({ ...e, [id]: { ...e[id], [field]: '' } }))
  }

  const submit = event => {
    event.preventDefault()
    const found = Object.fromEntries(seats.map(s => [s.idReserva, validate(values[s.idReserva])]))
    setErrors(found)
    if (Object.values(found).some(e => Object.keys(e).length)) return
    onSubmit(Object.fromEntries(seats.map(s => [s.idReserva, {
      dni: values[s.idReserva].dni, nombres: values[s.idReserva].nombres.trim(), apellidos: values[s.idReserva].apellidos.trim(),
    }])))
  }

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="text-xl font-bold text-ink">Datos de los pasajeros</h2>
      <p className="mt-1 text-sm text-ink-soft">Deben coincidir con el DNI que presentarán al abordar.</p>
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
