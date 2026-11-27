import { API_BASE_URL, SERVICE_PASSWORD, SERVICE_USER } from './config'

// Token de la cuenta de servicio (ver config.js). El cliente nunca ve un login:
// el token se obtiene en segundo plano y se guarda solo en memoria.
let cached = null // { token, expiresAt }
let pending = null

async function login() {
  if (!SERVICE_USER || !SERVICE_PASSWORD) {
    throw new Error('Falta configurar la conexión con el backend (VITE_API_USUARIO y VITE_API_PASSWORD en .env.local).')
  }
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario: SERVICE_USER, password: SERVICE_PASSWORD }),
  }).catch(() => { throw new Error('No pudimos conectar con el sistema de ventas. Intenta nuevamente en unos minutos.') })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.access_token) {
    throw new Error('El sistema de ventas rechazó la conexión. Revisa VITE_API_USUARIO y VITE_API_PASSWORD.')
  }
  cached = { token: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 }
  return cached.token
}

export async function getServiceToken({ force = false } = {}) {
  if (!force && cached && cached.expiresAt - Date.now() > 60_000) return cached.token
  // Evita varios logins simultáneos cuando la página hace varias llamadas a la vez.
  pending ??= login().finally(() => { pending = null })
  return pending
}
