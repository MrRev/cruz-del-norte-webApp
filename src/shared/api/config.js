// Conexión con el backend (ver .env.example). La web muestra solo datos reales
// devueltos por la API; no hay datos de ejemplo.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://cruzdelnorte.duckdns.org').replace(/\/$/, '')

// Cuenta de servicio con la que la web se autentica ante el backend.
// Hoy el backend exige un token con rol VENTAS para consultar viajes, reservar,
// pagar y emitir pasajes, así que la web inicia sesión por detrás con esa cuenta.
// Ese token permite leer los datos de TODOS los pasajeros: vite.config.js impide
// compilar para producción mientras esté configurada. Se elimina cuando el
// backend tenga endpoints públicos con token de compra de invitado.
export const SERVICE_USER = import.meta.env.VITE_API_USUARIO || ''
export const SERVICE_PASSWORD = import.meta.env.VITE_API_PASSWORD || ''
