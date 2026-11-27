// Rutas que opera la empresa. El backend no tiene (todavía) un endpoint
// público que liste las rutas, así que la web consulta la disponibilidad de
// estas rutas día por día. Cuando exista GET /api/v1/publico/rutas, esta
// lista se reemplaza por esa respuesta.
//
// Son las rutas con salidas diarias del backend (scripts/seed_bulk.py).
export const OPERATED_ROUTES = [
  { origen: 'Lima', destino: 'Chimbote', duracion: '6 h' },
  { origen: 'Lima', destino: 'Ica', duracion: '4 h 30 min' },
  { origen: 'Chimbote', destino: 'Lima', duracion: '6 h' },
  { origen: 'Ica', destino: 'Lima', duracion: '4 h 30 min' },
]

// Cuántos días hacia adelante se muestran en "Próximas salidas".
export const UPCOMING_DAYS = 7
