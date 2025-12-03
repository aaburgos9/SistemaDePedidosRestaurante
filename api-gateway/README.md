**API Gateway — README (Español)**

Resumen

El API Gateway es el punto de entrada central del sistema de pedidos. Recibe las solicitudes del frontend y las reenvía (proxy) al microservicio correspondiente (microservicio Python o Node). Centraliza responsabilidades transversales: CORS, timeouts, reintentos, logging y formato uniforme de respuestas.

Estructura del proyecto

- `src/`
  - `server.ts` - Arranque del servidor Express (entrada para producción)
  - `app.ts` - Configuración de la aplicación (middlewares, rutas)
  - `config/` - Variables de entorno y constantes
  - `controllers/` - Controladores de rutas (`Orders`, `Kitchen`)
  - `services/` - Servicios proxy que reenvían las peticiones a los microservicios
  - `middlewares/` - CORS, manejador de errores, logger
  - `utils/` - Formateador de respuestas y lógica de reintentos
  - `handlers/` - Estrategias para manejo de errores (ConnectionRefused, Timeout, etc.)
  - `tests/` - Pruebas unitarias e integradas

Variables de entorno (requeridas)

Configura estas variables (revisa `.env.example`):

- `PORT`: Puerto en el que escuchará el gateway (por defecto `3000`).
- `PYTHON_MS_URL`: URL base del microservicio Python (ej.: `http://python-ms:8000`).
- `NODE_MS_URL`: URL base del microservicio Node (ej.: `http://node-ms:3002`).
- `REQUEST_TIMEOUT`: Tiempo máximo para peticiones salientes en ms (ej.: `30000`).
- `RETRY_ATTEMPTS`: Número de reintentos para peticiones proxy.
- `CORS_ORIGIN`: Origen permitido para CORS (ej.: `http://localhost:5173`).

Ejecutar con Docker Compose

Desde la raíz del repositorio ejecuta:

```powershell
docker compose up -d --build
```

Este servicio debe ejecutarse junto a los otros (`python-ms`, `node-ms`, `mongo`, `rabbitmq`). Asegúrate de que Docker tenga acceso a Internet y a los registries.

Desarrollo local

1. Instalar dependencias:

```powershell
cd api-gateway
npm install
```

2. Ejecutar en modo desarrollo (recarga automática):

```powershell
npm run dev
```

3. Ejecutar pruebas:

```powershell
npm test
```

Build y ejecución en producción

```powershell
npm run build
npm start
```

Endpoints expuestos (resumen)

El gateway expone los endpoints principales que usa el frontend y los reenvía a los microservicios:

- `POST /orders`  → Reenvía a microservicio de Orders para crear un pedido.
- `GET /orders`   → Reenvía a microservicio de Orders para listar pedidos.
- `GET /kitchen`  → Reenvía a microservicio de Kitchen para la vista de cocina.

Ejemplos desde el frontend (fetch)

Crear un pedido:

```js
// Crear pedido
await fetch('http://localhost:3000/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ table: 5, products: [{ id: 'p1', qty: 2 }] })
});
```

Obtener pedidos:

```js
const res = await fetch('http://localhost:3000/orders');
const orders = await res.json();
```

Obtener vista de cocina:

```js
const kitchen = await fetch('http://localhost:3000/kitchen');
```

Ejemplo con axios (opcional)

```js
import axios from 'axios';

// Crear pedido
await axios.post('http://localhost:3000/orders', { table: 5, products: [{ id: 'p1', qty: 2 }] });

// Obtener pedidos
const { data: orders } = await axios.get('http://localhost:3000/orders');
```

Guía para integrar en el frontend (paso a paso)

1. Asegúrate de que Docker y todos los servicios estén arriba:

```powershell
docker compose up -d --build
docker compose ps
```

2. En el frontend (`orders-producer-frontend`) actualiza la URL base de la API a `http://localhost:3000` (en desarrollo local). Si ejecutas todo en Docker, usa `http://api-gateway:3000` desde otros contenedores.

3. Verifica flujo completo: crea un pedido desde la UI y confirma que aparece en la vista de cocina.

Comandos útiles de depuración

- Ver logs del gateway:

```powershell
docker compose logs -f api-gateway
```

- Si el gateway no alcanza a los microservicios, verifica `docker-compose.yml` y las variables `PYTHON_MS_URL` / `NODE_MS_URL`.

- Problemas con `npm` durante la construcción: revisa conexión a Internet, DNS y reinicia Docker Desktop.

Notas finales

- El gateway aplica lógica de reintentos y respuestas estandarizadas; las pruebas incluidas validan este comportamiento.
- Si cambias rutas o estructura TypeScript, actualiza `tsconfig.json` y `Dockerfile` según corresponda.
