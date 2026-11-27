// Intermediario entre la web y el backend de Cruz del Norte.
//
// Corre en el servidor (funciones de Vercel), nunca en el navegador:
// - La cuenta de servicio (rol VENTAS) vive solo aquí, en variables de entorno
//   sin prefijo VITE_, así que no llega al JavaScript público.
// - Solo se exponen las operaciones de compra; nada de /admin.
// - Cada asiento retenido recibe un "token de compra" firmado que solo sirve
//   para ESA reserva: nadie puede liberar, pagar o emitir reservas ajenas.
import crypto from 'node:crypto'

const env = name => process.env[name] || ''
const API_BASE_URL = () => (env('API_BASE_URL') || 'https://cruzdelnorte.duckdns.org').replace(/\/$/, '')

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status }
}

// ---------- Respuestas ----------
export const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } })

export function handle(fn) {
  return async request => {
    try {
      return await fn(request)
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500
      if (status >= 500) console.error('[api]', error)
      const mensaje = status >= 500 && !(error instanceof HttpError) ? 'Ocurrió un error inesperado. Intenta nuevamente.' : error.message
      return json({ mensaje }, status)
    }
  }
}

export async function readJson(request) {
  try { return await request.json() } catch { throw new HttpError(400, 'Solicitud inválida.') }
}

// ---------- Cuenta de servicio ----------
let cached = null // { token, expiresAt }
let pending = null

async function login() {
  if (!env('API_USUARIO') || !env('API_PASSWORD')) throw new HttpError(503, 'El sistema de ventas no está configurado.')
  let response
  try {
    response = await fetch(`${API_BASE_URL()}/api/v1/auth/login`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: env('API_USUARIO'), password: env('API_PASSWORD') }),
    })
  } catch {
    throw new HttpError(503, 'No pudimos conectar con el sistema de ventas. Intenta nuevamente en unos minutos.')
  }
  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.access_token) {
    console.error('[api] login del backend rechazado', response.status)
    throw new HttpError(503, 'El sistema de ventas no está disponible en este momento.')
  }
  cached = { token: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 }
  return cached.token
}

async function serviceToken(force = false) {
  if (!force && cached && cached.expiresAt - Date.now() > 60_000) return cached.token
  pending ??= login().finally(() => { pending = null })
  return pending
}

// Llama al backend con la cuenta de servicio. Devuelve los datos o lanza HttpError
// con el mensaje del backend (que ya está pensado para mostrarse al usuario).
export async function backend(path, options = {}, retried = false) {
  const headers = { Accept: 'application/json', ...(options.headers || {}) }
  if (options.body) headers['Content-Type'] = 'application/json'
  headers.Authorization = `Bearer ${await serviceToken()}`
  let response
  try {
    response = await fetch(`${API_BASE_URL()}${path}`, { ...options, headers })
  } catch {
    throw new HttpError(503, 'No pudimos conectar con el sistema de ventas. Intenta nuevamente en unos minutos.')
  }
  if (response.status === 401 && !retried) {
    await serviceToken(true)
    return backend(path, options, true)
  }
  const raw = await response.text()
  let data = null
  try { data = raw ? JSON.parse(raw) : null } catch { data = null }
  if (!response.ok) {
    // 401/403 serían un problema de la cuenta de servicio, no del cliente.
    if (response.status === 401 || response.status === 403) throw new HttpError(503, 'El sistema de ventas no está disponible en este momento.')
    throw new HttpError(response.status, data?.mensaje || data?.detail || 'No pudimos completar la operación.')
  }
  return data
}

// ---------- Token de compra (por reserva) ----------
const b64 = buffer => Buffer.from(buffer).toString('base64url')
const TOKEN_MINUTES = 60 // cubre la reserva temporal (15-25 min) + pago y emisión

function secret() {
  const value = env('PURCHASE_TOKEN_SECRET')
  if (value.length < 32) throw new HttpError(503, 'El sistema de compra no está configurado.')
  return value
}

export function signPurchase({ idReserva, idViaje }) {
  const payload = b64(JSON.stringify({ r: idReserva, v: idViaje, exp: Date.now() + TOKEN_MINUTES * 60_000 }))
  const signature = b64(crypto.createHmac('sha256', secret()).update(payload).digest())
  return `${payload}.${signature}`
}

export function verifyPurchase(token) {
  const [payload, signature] = String(token || '').split('.')
  if (!payload || !signature) throw new HttpError(401, 'Tu sesión de compra no es válida. Elige tus asientos de nuevo.')
  const expected = b64(crypto.createHmac('sha256', secret()).update(payload).digest())
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new HttpError(401, 'Tu sesión de compra no es válida. Elige tus asientos de nuevo.')
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
  if (Date.now() > data.exp) throw new HttpError(401, 'Tu sesión de compra venció. Elige tus asientos de nuevo.')
  return { idReserva: data.r, idViaje: data.v }
}

// ---------- Límite de uso por IP ----------
// En memoria de cada instancia: frena abusos simples (retener todos los
// asientos, gastar la consulta de DNI). Para algo más fuerte, Vercel KV o
// el firewall de Vercel.
const buckets = new Map()
export function rateLimit(request, key, max, windowMs) {
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local'
  const id = `${key}:${ip}`
  const now = Date.now()
  const bucket = buckets.get(id)
  if (!bucket || now > bucket.reset) { buckets.set(id, { count: 1, reset: now + windowMs }); return }
  bucket.count += 1
  if (bucket.count > max) throw new HttpError(429, 'Demasiadas solicitudes. Espera unos minutos e intenta de nuevo.')
}

export const positiveInt = (value, name) => {
  const number = Number(value)
  if (!Number.isInteger(number) || number <= 0) throw new HttpError(400, `${name} no es válido.`)
  return number
}
