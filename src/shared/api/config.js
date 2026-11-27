// Configuración de la conexión con el backend (ver .env.example).
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://cruzdelnorte.duckdns.org').replace(/\/$/, '')

// true: datos de ejemplo locales, sin backend (solo búsqueda; no permite comprar).
export const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'true') !== 'false'

// SOLO PRUEBAS: la web inicia sesión por detrás con una cuenta de VENTAS para
// usar los endpoints actuales del backend. vite.config.js impide compilar para
// producción con esta opción activa, porque el token permitiría leer los datos
// de todos los pasajeros. Se reemplaza por el token de compra de invitado.
export const DEMO_VENTAS = import.meta.env.VITE_DEMO_VENTAS === 'true'
