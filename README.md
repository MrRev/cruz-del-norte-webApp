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
| `VITE_USE_MOCKS` | `true` (por defecto) usa datos de ejemplo locales. Cambiar a `false` cuando el backend publique los endpoints públicos. |

Todo lo que empieza con `VITE_` queda visible en el JavaScript publicado: **nunca** guarde aquí claves privadas ni credenciales del personal.

## Estado actual

Cada opción de la barra de navegación tiene su propia página:

| Ruta | Página |
|---|---|
| `/` | Inicio: buscador, 3 rutas destacadas, pasos de compra y accesos al resto |
| `/destinos` | Todas las rutas + buscador |
| `/servicios` | Beneficios, cómo comprar y flota |
| `/mis-pasajes` | Consulta de pasaje por código + DNI |
| `/ayuda` | Preguntas frecuentes por tema, contacto y agencias |
| `/viajes?origen=&destino=&fecha=` | Resultados de búsqueda |

- ⏳ Datos de contacto y agencias de ejemplo en `src/shared/contact.js`; preguntas frecuentes en `src/features/landing/components/Faq.jsx`.
- ⏳ Compra en línea (asientos, pasajeros, pago, PDF): pendiente de los endpoints públicos del backend. `/compra/:idViaje` muestra por ahora un aviso.
- ⏳ Términos, privacidad y Libro de Reclamaciones: páginas provisionales, pendientes del contenido legal.

## Datos de ejemplo

Con `VITE_USE_MOCKS=true`:

- Rutas desde Lima a Trujillo, Chimbote, Chiclayo, Piura, Ica y Huaraz (y viceversa). Otras combinaciones devuelven "sin salidas".
- Mis pasajes: código `CN-DEMO-001` con DNI `45871236`.

Las respuestas imitan el formato real del backend (`DisponibilidadResponse` de SC-01), así que el cambio a la API real no requiere tocar componentes.

## Endpoints públicos que necesita del backend

Hoy todos los endpoints de venta exigen un token con rol `VENTAS`, que no puede exponerse en una web pública. La web espera estos endpoints sin login del personal:

| Endpoint | Para |
|---|---|
| `GET /api/v1/publico/rutas` | Ciudades y rutas populares (`{ ciudades, rutas }`) |
| `GET /api/v1/publico/viajes/disponibilidad` | Resultados de búsqueda |
| `GET /api/v1/publico/pasajes/{codigo}?dni=` | Mis pasajes |
| Retención de asiento, pasajeros, pago y emisión con token de compra de invitado | Flujo de compra (siguiente fase) |

## Estructura

```text
src/
  app/App.jsx                 rutas y scroll a secciones
  pages/                      una página por opción del menú + resultados e informativas
  features/
    landing/components/       secciones reutilizables (hero, rutas, servicios, FAQ)
    travel/                   buscador y servicio de viajes (+ datos de ejemplo)
    tickets/                  consulta de pasajes
  shared/
    api/http.js               cliente HTTP (sin tokens del personal)
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
