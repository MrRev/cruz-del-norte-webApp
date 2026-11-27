# Cruz del Norte · Web de clientes

Sitio web para que los clientes de **Cruz del Norte** busquen viajes y compren pasajes de bus en línea: eligen sus asientos en el mapa del bus, ingresan los datos de los pasajeros, pagan y descargan su pasaje en PDF.

Todos los datos (rutas, salidas, asientos, precios, reservas y pasajes) vienen del **backend real**. La web no tiene datos de ejemplo. Se despliega en **Vercel**: la interfaz es estática y las **funciones de servidor** de la carpeta `api/` hablan con el backend, de modo que ninguna credencial llega al navegador.

| Repositorio | Qué es |
|---|---|
| **Este repo** | Web de clientes |
| [duggandev/cruz-del-norte](https://github.com/duggandev/cruz-del-norte) | Backend: microservicios FastAPI (SC-01 a SC-06) detrás de un gateway nginx |
| [duggandev/cruz-del-norte-w](https://github.com/duggandev/cruz-del-norte-w) | Consola de operaciones (ventanilla y administración) |

## Stack

El mismo que la consola de operaciones:

- **React 19** + **Vite 8**
- **Tailwind CSS 4** (paleta de la marca en `src/styles.css`)
- **React Router 7** para las páginas
- **lucide-react** para los íconos
- **Funciones de Vercel** (`api/`, Node.js) como intermediario con el backend

## Requisitos

- **Node.js 20.19+ o 22.12+** (lo exige Vite 8)
- Acceso al backend (por defecto `https://cruzdelnorte.duckdns.org`) y la contraseña de la cuenta de servicio
- Para publicar: una cuenta de [Vercel](https://vercel.com) conectada a GitHub

## Instalación

```bash
git clone https://github.com/MrRev/cruz-del-norte-webApp.git
cd cruz-del-norte-webApp
npm install
cp .env.example .env.local
```

Complete `API_PASSWORD` y `PURCHASE_TOKEN_SECRET` (y, si la tiene, la clave de DNI) en `.env.local` y arranque:

```bash
npm run dev
```

La web queda en `http://localhost:5173`. `npm run dev` también ejecuta las funciones de `api/`, igual que Vercel.

## Variables de entorno

Son variables **del servidor**: las leen las funciones de `api/`, nunca el navegador. En su PC van en `.env.local` (no se sube al repo); en Vercel, en **Settings → Environment Variables**. La plantilla es `.env.example`.

| Variable | Obligatoria | Uso |
|---|---|---|
| `API_BASE_URL` | No | Gateway del backend. Por defecto `https://cruzdelnorte.duckdns.org`. |
| `API_USUARIO` | Sí | Usuario de la cuenta de servicio (rol `VENTAS`). |
| `API_PASSWORD` | Sí | Contraseña de la cuenta de servicio. |
| `PURCHASE_TOKEN_SECRET` | Sí | Firma los tokens de compra. Cadena aleatoria de 32+ caracteres. |
| `DNI_API_URL` | No | Servicio de consulta de DNI. Por defecto `https://api.apiperu.pe`. |
| `DNI_API_TOKEN` / `DNI_API_KEY` | No | Credenciales de apiperu.pe. Con ellas, al escribir un DNI se completan nombres y apellidos; sin ellas, se escriben a mano. |

Para generar `PURCHASE_TOKEN_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

⚠️ **Nunca use el prefijo `VITE_` para credenciales**: Vite copia esas variables al JavaScript público. El build se detiene si encuentra una variable `VITE_` con `PASSWORD`, `TOKEN`, `SECRET` o `KEY` en el nombre.

Después de cambiar `.env.local`, reinicie `npm run dev`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática y las funciones de `api/` |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el último build en `http://localhost:4173` (sin las funciones de `api/`) |

## Páginas

| Ruta | Página |
|---|---|
| `/` | **Inicio**: buscador, rutas destacadas con precio desde y próxima salida, pasos para comprar |
| `/destinos` | **Destinos**: todas las rutas y las **próximas salidas** de los próximos 7 días, agrupadas por día |
| `/servicios` | **Servicios**: beneficios, cómo comprar y tipos de bus |
| `/ayuda` | **Ayuda**: preguntas frecuentes, contacto y agencias |
| `/viajes?origen=&destino=&fecha=` | Resultados de búsqueda |
| `/compra/:idViaje` | **Compra**: asientos → pasajeros → pago → pasajes |
| `/terminos`, `/privacidad`, `/libro-de-reclamaciones` | Páginas legales (contenido pendiente) |

## Cómo funciona una compra

| Paso | En la web | Función de `api/` → backend |
|---|---|---|
| Buscar | Salidas de una ruta y fecha | `GET /api/disponibilidad` → `GET /api/v1/viajes/disponibilidad` (SC-01) |
| Mapa de asientos | Horizontal en computadora, vertical en celular. Se actualiza cada 15 s | `GET /api/asientos` → `GET /api/v1/viajes/{id}/asientos` (SC-01) |
| Elegir asiento | Queda reservado al tocarlo, con cuenta regresiva (hasta 10 por compra) | `retener` → `POST /api/v1/reservas/hold` → reserva `TEMPORAL` (SC-02) + **token de compra** |
| Quitar asiento o salir | Se libera | `liberar` → `POST /api/v1/reservas/{id}/liberacion` (SC-02) |
| Pasajeros | DNI, nombres y apellidos por asiento. Autocompletado por DNI y sin DNI repetidos | `pasajero` → `PATCH /api/v1/reservas/{id}/pasajero` (SC-02); `POST /api/dni` → apiperu.pe |
| Pago | Un pago por asiento con su propia `Idempotency-Key`: un reintento nunca cobra dos veces | `pagar` → `POST /api/v1/pagos` (SC-04) → reserva `CONFIRMADA` |
| Pasajes | Código y PDF descargable por pasajero | `emitir` → `POST /api/v1/pasajes` (SC-05) → `/documentos/{codigo}.pdf` |

- El **precio** de cada asiento lo calcula el backend; la web paga exactamente ese monto.
- La compra en curso se guarda en `sessionStorage`: recargar la página no la pierde. Si la reserva vence, se ofrece elegir de nuevo.
- **Pago:** el backend todavía no tiene una pasarela real (el proveedor Culqi no está implementado) y aprueba los pagos con su simulador, sin cobro a la tarjeta.

## Rutas y próximas salidas

El backend no tiene un endpoint que liste las rutas, así que las rutas que opera la empresa están en `src/features/travel/services/catalog.js` (`OPERATED_ROUTES`). La web consulta (vía `/api/disponibilidad`) la disponibilidad de cada una para los próximos `UPCOMING_DAYS` días (por defecto 7) y calcula precio desde, cantidad de salidas y próxima salida. El resultado se guarda en memoria 2 minutos.

**Para agregar una ruta**, súmela a `OPERATED_ROUTES` con su origen, destino y duración.

## Conexión con el backend

```
Navegador ──▶ /api/* (funciones de Vercel) ──▶ backend en la VPS
                  │
                  ├─ guarda la cuenta de servicio (nunca llega al navegador)
                  ├─ solo expone las operaciones de compra (nada de /admin)
                  ├─ quita de las respuestas los ids de reservas ajenas
                  ├─ firma un token de compra por asiento retenido
                  └─ limita retenciones y consultas de DNI por IP
```

Hoy el backend exige un token con rol `VENTAS` para consultar viajes, reservar, pagar y emitir pasajes: no tiene endpoints públicos. Las funciones de `api/` hacen ese papel (`api/_lib/backend.js`):

1. Inician sesión con `API_USUARIO` / `API_PASSWORD` (`POST /api/v1/auth/login`), guardan el JWT en memoria, lo renuevan antes de que venza y reintentan una vez si el backend responde 401.
2. Al **retener** un asiento devuelven un **token de compra** firmado con `PURCHASE_TOKEN_SECRET` (HMAC-SHA256, válido 60 minutos) que contiene solo esa reserva. Liberar, cambiar el pasajero, pagar, emitir y consultar DNI **exigen ese token** y actúan únicamente sobre su reserva: un cliente no puede tocar reservas ajenas.
3. El token de la pasarela lo decide el servidor (`PAYMENT_TOKEN_PASARELA`, por defecto el simulador del backend), no el navegador.

| Función | Método | Uso |
|---|---|---|
| `/api/disponibilidad?origen&destino&fecha` | GET | Salidas de una ruta y fecha |
| `/api/asientos?idViaje` | GET | Mapa de asientos con precios |
| `/api/compra` | POST | `{ accion: retener \| liberar \| pasajero \| pagar \| emitir, ... }` |
| `/api/dni` | POST | `{ dni, token }` → nombres y apellidos |

Como las llamadas al backend salen del servidor (no del navegador), el backend **no** necesita el dominio de Vercel en `CORS_ALLOWED_ORIGINS`.

## Despliegue en Vercel

1. En [vercel.com](https://vercel.com) → **Add New… → Project** → importe este repositorio.
2. Vercel detecta Vite y usa `vercel.json`: build `npm run build`, salida `dist`, y redirección de las páginas a `index.html` (para que `/destinos` no dé 404 al recargar).
3. En **Environment Variables** agregue `API_BASE_URL`, `API_USUARIO`, `API_PASSWORD`, `PURCHASE_TOKEN_SECRET` y, si tiene, `DNI_API_TOKEN` / `DNI_API_KEY`.
4. **Deploy.** Cada push a `main` vuelve a desplegar; cada PR genera una vista previa.

**Limitaciones actuales** (dependen del backend, no de la web):

- El backend aprueba los pagos con su simulador: no hay cobro real hasta integrar Culqi.
- El backend acepta la contraseña de demostración de `ventas`, visible en la consola de operaciones. Conviene definir `AUTH_USERS_JSON` en la VPS con contraseñas propias y actualizar `API_PASSWORD` en Vercel.
- Los límites por IP viven en la memoria de cada instancia de Vercel: frenan abusos simples, no ataques distribuidos. Para más protección, active el firewall de Vercel o use Vercel KV.

## Estructura

```text
api/                            funciones de servidor (Vercel)
  _lib/backend.js               cuenta de servicio, tokens de compra, límites por IP
  disponibilidad.js · asientos.js · compra.js · dni.js
vercel.json                     build, salida y redirección de páginas
src/
  main.jsx                      punto de entrada
  app/App.jsx                   rutas y scroll entre páginas
  pages/                        una página por opción del menú, resultados y compra
  features/
    landing/components/         secciones de la portada (hero, rutas, servicios, preguntas frecuentes)
    travel/                     buscador, próximas salidas, servicio de viajes y rutas operadas (catalog.js)
    purchase/                   compra: hook usePurchase, mapa de asientos, pasos, pago, DNI
  shared/
    api/http.js                 cliente HTTP hacia /api/*
    ui/                         cabecera, pie, logo y encabezado de página
    contact.js                  teléfonos, correo y agencias
    format.js                   moneda y fechas en es-PE
  styles.css                    Tailwind + paleta de la marca
```

## Pendientes

- Datos de contacto y agencias reales en `src/shared/contact.js` (hoy son de ejemplo) y preguntas frecuentes en `src/features/landing/components/Faq.jsx`.
- Contenido de términos y condiciones, privacidad y Libro de Reclamaciones.
- Endpoints públicos en el backend, para que la web no dependa de una cuenta de ventas.
- Pago con tarjeta (Culqi) y envío del pasaje por correo.
