import { postJson } from '../../../shared/api/http'

// Nombres y apellidos por DNI a través de api/dni.js (apiperu.pe en el
// servidor). Requiere el token de compra de un asiento retenido.
// Si el servidor no tiene configurada la consulta (501), se deja de intentar
// y el cliente escribe los datos a mano.
let available = true

export const dniLookupAvailable = () => available

export async function lookupDni(dni, token) {
  try {
    return await postJson('/api/dni', { dni, token })
  } catch (error) {
    if (error.status === 501) available = false
    throw error
  }
}
