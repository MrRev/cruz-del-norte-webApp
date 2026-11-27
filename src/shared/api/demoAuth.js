import { API_BASE_URL, DEMO_VENTAS } from './config'

// Acceso de pruebas con la cuenta de ventas (ver DEMO_VENTAS en config.js).
// El cliente nunca ve un login: el token se obtiene en segundo plano y se
// guarda solo en memoria.
let cached = null // { token, expiresAt }
let pending = null

async function login() {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario: import.meta.env.VITE_DEMO_USUARIO || 'ventas',
      password: import.meta.env.VITE_DEMO_PASSWORD || '',
    }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.access_token) {
    throw new Error('No se pudo conectar con el sistema de ventas. Revisa VITE_DEMO_USUARIO y VITE_DEMO_PASSWORD.')
  }
  cached = { token: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 }
  return cached.token
}

export async function getDemoToken({ force = false } = {}) {
  if (!DEMO_VENTAS) return null
  if (!force && cached && cached.expiresAt - Date.now() > 60_000) return cached.token
  // Evita varios logins simultáneos cuando la página hace varias llamadas a la vez.
  pending ??= login().finally(() => { pending = null })
  return pending
}
