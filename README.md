# Cruz del Norte · Web de clientes

Sitio web para que los clientes de **Cruz del Norte** busquen viajes y compren pasajes de bus en línea: eligen sus asientos en el mapa del bus, ingresan los datos de los pasajeros, pagan y descargan su pasaje en PDF.

Todos los datos (rutas, salidas, asientos, precios, reservas y pasajes) vienen del **backend real** a través de su API. La web no tiene datos de ejemplo.

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

## Requisitos

- **Node.js 20.19+ o 22.12+** (lo exige Vite 8)
- Acceso al backend (por defecto `https://cruzdelnorte.duckdns.org`) y la contraseña de la cuenta de servicio

## Instalación

```bash
git clone https://github.com/MrRev/cruz-del-norte-webApp.git
cd cruz-del-norte-webApp
npm install
cp .env.example .env.local
```

Complete `VITE_API_PASSWORD` (y, si la tiene, la clave de DNI) en `.env.local` y arranque:

```bash
npm run dev
```

La web queda en `http://localhost:5173`.

## Variables de entorno

Se configuran en `.env.local`, que **no se sube al repo**. La plantilla es `.env.example`.

| Variable | Obligatoria | Uso |
|---|---|---|
| `VITE_API_BASE_URL` | No | Gateway del backend. Por defecto `https://cruzdelnorte.duckdns.org`. |
| `VITE_API_USUARIO` | Sí | Usuario de la cuenta de servicio (rol `VENTAS`). |
| `VITE_API_PASSWORD` | Sí | Contraseña de la cuenta de servicio. |
| `VITE_DNI_API_URL` | No | Servicio de consulta de DNI. Por defecto `https://api.apiperu.pe`. |
| `VITE_DNI_API_TOKEN` / `VITE_DNI_API_KEY` | No | Credenciales de apiperu.pe. Con ellas, al escribir un DNI se completan nombres y apellidos; sin ellas, se escriben a mano. |

Después de cambiar `.env.local`, reinicie `npm run dev`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Build de producción en `dist/` (ver "Antes de publicar") |
| `npm run build:local` | Build para revisar en su PC, permitido con las credenciales configuradas |
| `npm run preview` | Sirve el último build en `http://localhost:4173` |

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

| Paso | En la web | En el backend |
|---|---|---|
| Buscar | Salidas de una ruta y fecha | `GET /api/v1/viajes/disponibilidad` (SC-01) |
| Mapa de asientos | Horizontal en computadora, vertical en celular. Se actualiza cada 15 s | `GET /api/v1/viajes/{id}/asientos` (SC-01) |
| Elegir asiento | Queda reservado al tocarlo, con cuenta regresiva (hasta 10 por compra) | `POST /api/v1/reservas/hold` → reserva `TEMPORAL` (SC-02) |
| Quitar asiento o salir | Se libera | `POST /api/v1/reservas/{id}/liberacion` (SC-02) |
| Pasajeros | DNI, nombres y apellidos por asiento. Autocompletado por DNI (apiperu.pe) y sin DNI repetidos | `PATCH /api/v1/reservas/{id}/pasajero` (SC-02) |
| Pago | Un pago por asiento con su propia `Idempotency-Key`: un reintento nunca cobra dos veces | `POST /api/v1/pagos` (SC-04) → reserva `CONFIRMADA` |
| Pasajes | Código y PDF descargable por pasajero | `POST /api/v1/pasajes` (SC-05) → `/documentos/{codigo}.pdf` |

- El **precio** de cada asiento lo calcula el backend; la web paga exactamente ese monto.
- La compra en curso se guarda en `sessionStorage`: recargar la página no la pierde. Si la reserva vence, se ofrece elegir de nuevo.
- **Pago:** el backend todavía no tiene una pasarela real (el proveedor Culqi no está implementado) y aprueba los pagos con su simulador, sin cobro a la tarjeta.

## Rutas y próximas salidas

El backend no tiene un endpoint que liste las rutas, así que las rutas que opera la empresa están en `src/features/travel/services/catalog.js` (`OPERATED_ROUTES`). La web consulta la disponibilidad de cada una para los próximos `UPCOMING_DAYS` días (por defecto 7) y calcula precio desde, cantidad de salidas y próxima salida. El resultado se guarda en memoria 2 minutos.

**Para agregar una ruta**, súmela a `OPERATED_ROUTES` con su origen, destino y duración.

## Conexión con el backend

Hoy el backend exige un token con rol `VENTAS` para consultar viajes, reservar, pagar y emitir pasajes: no tiene endpoints públicos. Por eso la web inicia sesión en segundo plano con una **cuenta de servicio** (`src/shared/api/serviceAuth.js`):

1. `POST /api/v1/auth/login` con `VITE_API_USUARIO` y `VITE_API_PASSWORD` → JWT válido por 2 horas.
2. El token se guarda en memoria y `src/shared/api/http.js` lo envía como `Authorization: Bearer …` en cada llamada.
3. Si el backend responde 401, se renueva el token y se reintenta una vez.

El cliente nunca ve un login. El dominio desde el que se abre la web debe estar en `CORS_ALLOWED_ORIGINS` del backend (ya incluye `http://localhost:5173`).

## Antes de publicar

⚠️ **La web todavía no se puede publicar en internet.** Todo lo que empieza con `VITE_` queda dentro del JavaScript que descarga el navegador:

- Con la **cuenta de servicio**, cualquiera podría leer las reservas, DNI y pagos de todos los pasajeros.
- Con la **clave de apiperu.pe**, cualquiera podría gastar las consultas pagadas de la cuenta.

Por eso **`npm run build` falla** mientras `VITE_API_PASSWORD`, `VITE_DNI_API_TOKEN` o `VITE_DNI_API_KEY` estén configuradas.

Para publicar, el backend necesita:

| Endpoint | Para |
|---|---|
| `GET /api/v1/publico/rutas` | Rutas y ciudades (reemplaza `catalog.js`) |
| `GET /api/v1/publico/viajes/disponibilidad` | Búsqueda y próximas salidas |
| `GET /api/v1/publico/viajes/{id}/asientos` | Mapa de asientos, sin datos personales |
| Retención de asientos que devuelva un **token de compra de invitado**, válido solo para esas reservas, y con él: pasajeros, pago y emisión | Compra |
| Consulta de DNI con límite de uso | Autocompletado de pasajeros |

Al tenerlos, solo cambian `src/shared/api` y `src/features/*/services`; las páginas no se tocan. Para cobrar de verdad, además, el backend debe integrar Culqi.

## Despliegue

Es una aplicación de una sola página (SPA): el servidor debe devolver `index.html` para cualquier ruta. Con nginx:

```nginx
location / {
    root /usr/share/nginx/html;
    try_files $uri /index.html;
}
```

Agregue el dominio de la web a `CORS_ALLOWED_ORIGINS` del backend.

## Estructura

```text
src/
  main.jsx                      punto de entrada
  app/App.jsx                   rutas y scroll entre páginas
  pages/                        una página por opción del menú, resultados y compra
  features/
    landing/components/         secciones de la portada (hero, rutas, servicios, preguntas frecuentes)
    travel/                     buscador, próximas salidas, servicio de viajes y rutas operadas (catalog.js)
    purchase/                   compra: hook usePurchase, mapa de asientos, pasos, pago, DNI
  shared/
    api/                        configuración, cliente HTTP y cuenta de servicio
    ui/                         cabecera, pie, logo y encabezado de página
    contact.js                  teléfonos, correo y agencias
    format.js                   moneda y fechas en es-PE
  styles.css                    Tailwind + paleta de la marca
```

## Pendientes

- Datos de contacto y agencias reales en `src/shared/contact.js` (hoy son de ejemplo) y preguntas frecuentes en `src/features/landing/components/Faq.jsx`.
- Contenido de términos y condiciones, privacidad y Libro de Reclamaciones.
- Endpoints públicos en el backend para poder publicar (ver "Antes de publicar").
- Pago con tarjeta (Culqi) y envío del pasaje por correo.
