# Cruz del Norte · Web de clientes

Landing y venta de pasajes en línea para clientes de Cruz del Norte. Usa el mismo stack que la consola de operaciones ([duggandev/cruz-del-norte-w](https://github.com/duggandev/cruz-del-norte-w)): **React + Vite + Tailwind CSS**, con íconos de lucide-react y `react-router` para las páginas.

## Ejecutar

```bash
npm install
cp .env.example .env
npm run dev
```

Build de producción en `dist/`:

```bash
npm run build
npm run preview
```

## Variables de entorno

| Variable | Uso |
|---|---|
| `VITE_API_BASE_URL` | URL del gateway del backend ([duggandev/cruz-del-norte](https://github.com/duggandev/cruz-del-norte)). |
| `VITE_USE_MOCKS` | `true` (por defecto): datos de ejemplo, se puede buscar pero no comprar. `false`: usa el backend. |
| `VITE_DEMO_VENTAS` | **Solo pruebas locales.** `true`: la web inicia sesión por detrás con una cuenta de ventas para poder comprar con los endpoints actuales. |
| `VITE_DEMO_USUARIO` / `VITE_DEMO_PASSWORD` | Cuenta de ventas para `VITE_DEMO_VENTAS`. Póngala en `.env.local` (no se sube al repo). |

Todo lo que empieza con `VITE_` queda visible en el JavaScript publicado: **nunca** publique claves privadas ni credenciales del personal.

## Conectar con el backend (compra completa)

Hoy todos los endpoints de venta del backend exigen un token con rol `VENTAS`. Mientras se crean los endpoints públicos con token de invitado, la web puede probarse de punta a punta en **modo de pruebas**: inicia sesión con la cuenta de ventas en segundo plano (el cliente no ve ningún login).

1. Cree `.env.local`:

   ```bash
   VITE_API_BASE_URL=https://cruzdelnorte.duckdns.org   # o http://localhost:8080 con un backend local
   VITE_USE_MOCKS=false
   VITE_DEMO_VENTAS=true
   VITE_DEMO_USUARIO=ventas
   VITE_DEMO_PASSWORD=la-contraseña-de-ventas
   ```

2. `npm run dev` y compre desde el buscador.

⚠️ **Nunca publique la web con `VITE_DEMO_VENTAS=true`.** Cualquiera podría copiar el token desde el navegador y leer las reservas, DNI y pagos de todos los pasajeros. Por eso `npm run build` **falla** si la opción está activa. `npm run build:demo` permite un build local para probar con `npm run preview`.

Contra la VPS, use un backend con **datos de demostración**, no clientes reales, y con el simulador de pagos (`PAYMENT_PROVIDER=mock`). El dominio de la web debe estar en `CORS_ALLOWED_ORIGINS` (ya incluye `http://localhost:5173`).

## Cómo funciona una compra

| Paso | Web | Backend |
|---|---|---|
| Buscar | `/viajes` | `GET /viajes/disponibilidad` (SC-01) |
| Elegir asientos | `/compra/:idViaje`: el mapa se refresca cada 15 s | `GET /viajes/{id}/asientos` (SC-01) |
| Tocar un asiento | Se reserva al instante y empieza la cuenta regresiva | `POST /reservas/hold` → reserva `TEMPORAL` (SC-02) |
| Quitar un asiento / salir | Se libera | `POST /reservas/{id}/liberacion` (SC-02) |
| Datos de pasajeros | DNI, nombres y apellidos por asiento | `PATCH /reservas/{id}/pasajero` (SC-02) |
| Pago | Un pago por asiento con `Idempotency-Key` propia: reintentar no cobra dos veces | `POST /pagos` con el simulador `mock_aprobado` (SC-04) → reserva `CONFIRMADA` |
| Pasajes | Código y PDF por pasajero | `POST /pasajes` (SC-05) → `/documentos/{codigo}.pdf` |

El precio de cada asiento lo calcula el backend (el mapa trae el precio y el pago debe coincidir). La compra en curso se guarda en `sessionStorage`: recargar la página no pierde los asientos; si la reserva vence, se ofrece elegir de nuevo.

## Estado actual

Cada opción de la barra de navegación tiene su propia página:

| Ruta | Página |
|---|---|
| `/` | Inicio: buscador, 3 rutas destacadas, pasos de compra y accesos al resto |
| `/destinos` | Todas las rutas + buscador |
| `/servicios` | Beneficios, cómo comprar y flota |
| `/ayuda` | Preguntas frecuentes por tema, contacto y agencias |
| `/viajes?origen=&destino=&fecha=` | Resultados de búsqueda |
| `/compra/:idViaje` | Compra: asientos → pasajeros → pago → pasajes |

- ⏳ Datos de contacto y agencias de ejemplo en `src/shared/contact.js`; preguntas frecuentes en `src/features/landing/components/Faq.jsx`.
- ✅ Compra en línea (asientos, pasajeros, pago simulado, PDF) en modo de pruebas con `VITE_DEMO_VENTAS`.
- ⏳ Compra para el público: pendiente del token de invitado en el backend (ver abajo).
- ⏳ Términos, privacidad y Libro de Reclamaciones: páginas provisionales, pendientes del contenido legal.

## Datos de ejemplo

Con `VITE_USE_MOCKS=true`:

- Rutas desde Lima a Trujillo, Chimbote, Chiclayo, Piura, Ica y Huaraz (y viceversa). Otras combinaciones devuelven "sin salidas".

Las respuestas imitan el formato real del backend (`DisponibilidadResponse` de SC-01), así que el cambio a la API real no requiere tocar componentes.

## Endpoints públicos que necesita del backend

Para publicar la web hay que reemplazar el modo de pruebas por endpoints sin login del personal. Solo cambia la capa `src/features/*/services`; las páginas no se tocan:

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
    travel/                   buscador y servicio de viajes (+ datos de ejemplo)
    purchase/                 compra: hook usePurchase, mapa de asientos, pasos y servicios
  shared/
    api/                      cliente HTTP, configuración y acceso de pruebas (demoAuth)
    ui/                       cabecera, pie, logo y encabezado de página
    contact.js                teléfonos, correo y agencias (de ejemplo)
    format.js                 moneda y fechas en es-PE
  styles.css                  Tailwind + paleta de la marca
```

## Despliegue

Es una SPA: el servidor debe devolver `index.html` para cualquier ruta. En nginx:

```nginx
location / {
    root /usr/share/nginx/html;
    try_files $uri /index.html;
}
```

Además, el dominio de la web debe agregarse a `CORS_ALLOWED_ORIGINS` del backend.
