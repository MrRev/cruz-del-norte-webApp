export const formatSoles = value =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(Number(value || 0))

export const todayISO = () => {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export const formatLongDate = iso => {
  if (!iso) return ''
  const date = new Date(`${iso}T12:00:00`)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
}

export const BUS_LABEL = { DOS_PISOS_48: 'Bus de dos pisos', UN_PISO_48: 'Bus de un piso' }
