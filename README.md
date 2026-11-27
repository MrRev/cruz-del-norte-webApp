# Cruz del Norte · Web de clientes

Landing y venta de pasajes en línea para clientes de Cruz del Norte. Usa el mismo stack que la consola de operaciones ([duggandev/cruz-del-norte-w](https://github.com/duggandev/cruz-del-norte-w)): **React + Vite + Tailwind CSS**, con íconos de lucide-react y `react-router` para las páginas.

Muestra **solo datos reales** del backend (viajes, asientos, precios) a través de la API: no hay datos de ejemplo.

## Ejecutar

```bash
npm install
cp .env.example .env.local   # y complete VITE_API_PASSWORD
npm run dev
```

## Variables de entorno (`.env.local`)

| Variable | Uso |
|---|---|
| `VITE_API_BASE_URL` | Gateway del backend ([duggandev/cruz-del-norte](https://github.com/duggandev/cruz-del-norte)). Por defecto `https://cruzdelnorte.duckdns.org`. |
| `VITE_API_USUARIO` / `VITE_API_PASSWORD` | Cuenta de servicio con la que la web se conecta al backend (rol `VENTAS`). |

`.env.local` no se sube al repo. Todo lo que empieza con `VITE_` queda dentro del JavaScript que descarga el navegador.

## Conexión con el backend

Hoy el backend exige un token con rol `VENTAS` para consultar viajes, reservar, pagar y emitir pasajes; no tiene endpoints públicos. Por eso la web inicia sesión por detrás con una **cuenta de servicio** (el cliente no ve ningún login) y con ella usa los endpoints actuales.

⚠️ **Esta forma de conexión no se puede publicar.** La contraseña quedaría en el JavaScript, y con el token cualquiera podría leer las reservas, DNI y pagos de todos los pasajeros. Por eso `npm run build` **falla** mientras `VITE_API_PASSWORD` esté configurada. Para generar un build en tu PC (y verlo con `npm run preview`) use `npm run build:local`.

Para publicarla, el backend necesita los endpoints públicos de la sección "Endpoints públicos que necesita del backend". Al tenerlos, solo cambian `src/shared/api` y `src/features/*/services`.

El dominio desde el que se abre la web debe estar en `CORS_ALLOWED_ORIGINS` del backend (ya incluye `http://localhost:5173`).

## Rutas y próximas salidas

Las rutas destacadas, la página Destinos y las ciudades del buscador muestran **datos reales**: la web consulta la disponibilidad de las rutas de `src/features/travel/services/catalog.js` (`OPERATED_ROUTES`) para los próximos `UPCOMING_DAYS` días y calcula precio desde, cantidad de salidas y próxima salida. Son solo lecturas (`GET /viajes/disponibilidad`) y el resultado se guarda en memoria 2 minutos.

El backend no tiene un endpoint que liste las rutas, por eso la lista está en `catalog.js` (hoy, las 4 rutas con salidas diarias). Son ~28 consultas por carga: con un `GET /api/v1/publico/rutas` y otro de próximas salidas en el backend sería una sola.

## Cómo funciona una compra

| Paso | Web | Backend |
|---|---|---|
| Buscar | `/viajes` | `GET /viajes/disponibilidad` (SC-01) |
| Elegir asientos | `/compra/:idViaje`: el mapa se refresca cada 15 s | `GET /viajes/{id}/asientos` (SC-01) |
| Tocar un asiento | Se reserva al instante y empieza la cuenta regresiva | `POST /reservas/hold` → reserva `TEMPORAL` (SC-02) |
| Quitar un asiento / salir | Se libera | `POST /reservas/{id}/liberacion` (SC-02) |
| Datos de pasajeros | DNI, nombres y apellidos por asiento | `PATCH /reservas/{id}/pasajero` (SC-02) |
| Pago | Un pago por asiento con `Idempotency-Key` propia: reintentar no cobra dos veces | `POST /pagos` (SC-04) → reserva `CONFIRMADA` |
| Pasajes | Código y PDF por pasajero | `POST /pasajes` (SC-05) → `/documentos/{codigo}.pdf` |

**Sobre el pago:** el backend todavía no tiene una pasarela real (el proveedor Culqi no está implementado), así que aprueba los pagos con su simulador y no hay cobro a la tarjeta. La web lo indica en el paso de pago. Cuando el backend tenga Culqi, en ese paso va el formulario de tarjeta.

El precio de cada asiento lo calcula el backend (el mapa trae el precio y el pago debe coincidir). La compra en curso se guarda en `sessionStorage`: recargar la página no pierde los asientos; si la reserva vence, se ofrece elegir de nuevo.

## Estado actual

Cada opción de la barra de navegación tiene su propia página:

| Ruta | Página |
|---|---|
| `/` | Inicio: buscador, 3 rutas destacadas, pasos de compra y accesos al resto |
| `/destinos` | Todas las rutas + buscador + **próximas salidas** de los próximos 7 días |
| `/servicios` | Beneficios, cómo comprar y flota |
| `/ayuda` | Preguntas frecuentes por tema, contacto y agencias |
| `/viajes?origen=&destino=&fecha=` | Resultados de búsqueda |
| `/compra/:idViaje` | Compra: asientos → pasajeros → pago → pasajes |

- ⏳ Datos de contacto y agencias de ejemplo en `src/shared/contact.js`; preguntas frecuentes en `src/features/landing/components/Faq.jsx`.
- ✅ Compra completa con datos reales: asientos, pasajeros, pago (sin cobro: el backend no tiene pasarela) y pasajes en PDF.
- ⏳ Publicación: pendiente de los endpoints públicos del backend (ver abajo).
- ⏳ Pago con tarjeta: pendiente de la integración de Culqi en el backend.
- ⏳ Términos, privacidad y Libro de Reclamaciones: páginas provisionales, pendientes del contenido legal.

## Endpoints públicos que necesita del backend

Para publicar la web hay que reemplazar la cuenta de servicio por endpoints sin login del personal. Solo cambia la capa `src/features/*/services`; las páginas no se tocan:

| Endpoint | Para |
|---|---|
| `GET /api/v1/publico/rutas` | Ciudades y rutas populares (`{ ciudades, rutas }`) |
| `GET /api/v1/publico/viajes/disponibilidad` | Resultados de búsqueda |
| `GET /api/v1/publico/viajes/{id}/asientos` | Mapa de asientos (sin datos personales) |
| Retención de asiento que devuelva un **token de compra de invitado**, válido solo para esas reservas, y con él: pasajeros, pago y emisión | Flujo de compra |

## Estructura

```text
src/
  app/App.jsx                 rutas y scroll a secciones
  pages/                      una página por opción del menú + resultados e informativas
  features/
    landing/components/       secciones reutilizables (hero, rutas, servicios, FAQ)
    travel/                   buscador, servicio de viajes y rutas operadas (catalog.js)
    purchase/                 compra: hook usePurchase, mapa de asientos, pasos y servicios
  shared/
    api/                      cliente HTTP, configuración y cuenta de servicio (serviceAuth)
    ui/                       cabecera, pie, logo y encabezado de página
    contact.js                teléfonos, correo y agencias (de ejemplo)
    format.js                 moneda y fechas en es-PE
  styles.css                  Tailwind + paleta de la marca
```

## Despliegue

Requiere primero los endpoints públicos (ver arriba). Es una SPA: el servidor debe devolver `index.html` para cualquier ruta. En nginx:

```nginx
location / {
    root /usr/share/nginx/html;
    try_files $uri /index.html;
}
```

Además, el dominio de la web debe agregarse a `CORS_ALLOWED_ORIGINS` del backend.
