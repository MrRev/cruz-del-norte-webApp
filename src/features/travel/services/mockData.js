// Datos de ejemplo con la misma forma que las respuestas del backend
// (DisponibilidadResponse de SC-01). Se usan mientras no existan los
// endpoints públicos; ver VITE_USE_MOCKS en .env.example.

export const CITIES = ['Lima', 'Chimbote', 'Trujillo', 'Chiclayo', 'Piura', 'Cajamarca', 'Huaraz', 'Ica', 'Arequipa']

export const ROUTES = [
  { origen: 'Lima', destino: 'Trujillo', desde: 65, duracion: '9 h', salidasDiarias: 6 },
  { origen: 'Lima', destino: 'Chimbote', desde: 55, duracion: '6 h', salidasDiarias: 5 },
  { origen: 'Lima', destino: 'Chiclayo', desde: 85, duracion: '12 h', salidasDiarias: 4 },
  { origen: 'Lima', destino: 'Piura', desde: 95, duracion: '15 h', salidasDiarias: 3 },
  { origen: 'Lima', destino: 'Ica', desde: 40, duracion: '4 h 30 min', salidasDiarias: 8 },
  { origen: 'Lima', destino: 'Huaraz', desde: 60, duracion: '8 h', salidasDiarias: 3 },
]

const BASE_TIMES = ['06:30', '08:15', '10:45', '14:00', '19:30', '22:15']

// Genera salidas deterministas para una ruta y fecha, de modo que la misma
// búsqueda siempre devuelva el mismo resultado.
export function mockAvailability({ origen, destino, fecha }) {
  const route = ROUTES.find(r =>
    (r.origen === origen && r.destino === destino) || (r.origen === destino && r.destino === origen))
  if (!route || origen === destino) return { origen, destino, fecha, viajes: [] }
  const seed = [...`${origen}${destino}${fecha}`].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const viajes = BASE_TIMES.slice(0, route.salidasDiarias).map((horaSalida, index) => {
    const libres = 4 + ((seed + index * 7) % 40)
    const tipoBus = index % 2 === 0 ? 'DOS_PISOS_48' : 'UN_PISO_48'
    return {
      idViaje: 9000 + ((seed + index) % 900),
      horaSalida,
      tarifa: route.desde + (index % 3) * 10,
      tipoBus,
      duracion: route.duracion,
      asientosDisponibles: Array.from({ length: libres }, (_, i) => i + 1),
    }
  })
  return { origen, destino, fecha, viajes }
}
