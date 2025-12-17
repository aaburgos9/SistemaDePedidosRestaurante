
# API Gateway — Gestión Centralizada de Pedidos

Punto de entrada central del sistema de pedidos. Recibe solicitudes del frontend y las reenvía (proxy) a los microservicios correspondientes (Python o Node). Centraliza CORS, timeouts, reintentos, logging y formato uniforme de respuestas.

- Puerto: 3000
- Seguridad: JWT (header `Authorization: Bearer <token>`, si aplica)
- Testing: Jest
- Cobertura: ver sección de tests

## Estructura del Proyecto
```
api-gateway/
├── Dockerfile         # Imagen para despliegue en contenedores
├── jest.config.js     # Configuración de Jest para testing
├── package.json       # Dependencias y scripts del proyecto
├── README.md          # Documentación principal
├── tsconfig.json      # Configuración de TypeScript
├── coverage/          # Reportes de cobertura de tests
└── src/               # Código fuente principal
    ├── app.ts         # Configuración de la app (middlewares, rutas)
    ├── server.ts      # Entrada principal del servidor Express
    ├── config/        # Variables de entorno y constantes
    ├── controllers/   # Controladores de rutas (Orders, Kitchen)
    ├── services/      # Servicios proxy hacia microservicios
    ├── middlewares/   # CORS, logger, manejador de errores
    ├── utils/         # Utilidades: formateo, reintentos
    ├── handlers/      # Estrategias de manejo de errores
    └── tests/         # Pruebas unitarias e integradas
```

Cada archivo/carpeta cumple una función específica:
- **Dockerfile**: Permite crear la imagen Docker para despliegue.
- **jest.config.js**: Define cómo se ejecutan los tests.
- **package.json**: Lista dependencias, scripts y metadatos.
- **README.md**: Documentación del servicio.
- **tsconfig.json**: Opciones de compilación TypeScript.
- **coverage/**: Resultados de cobertura de pruebas.
- **src/**: Todo el código fuente del servicio.
  - **app.ts**: Configuración de la app Express (middlewares, rutas).
  - **server.ts**: Arranque del servidor Express.
  - **config/**: Variables de entorno y constantes.
  - **controllers/**: Controladores de rutas (`Orders`, `Kitchen`).
  - **services/**: Proxy hacia microservicios Python/Node.
  - **middlewares/**: CORS, logger, manejador de errores.
  - **utils/**: Formateo de respuestas, lógica de reintentos.
  - **handlers/**: Estrategias para manejo de errores (Timeout, ConnectionRefused, etc).
  - **tests/**: Pruebas unitarias e integradas.

## Endpoints

**Pedidos**
- POST /orders  → Crear pedido (proxy a microservicio Orders)
- GET /orders   → Listar pedidos (proxy a microservicio Orders)

**Cocina**
- GET /kitchen  → Vista de cocina (proxy a microservicio Kitchen)

## Variables de entorno
```
PORT=3000
PYTHON_MS_URL=http://python-ms:8000
NODE_MS_URL=http://node-ms:3002
REQUEST_TIMEOUT=30000
RETRY_ATTEMPTS=3
CORS_ORIGIN=http://localhost:5173
```

## Desarrollo
```bash
cd api-gateway
npm install
npm run dev
npm test                    # Ejecutar tests
npm test -- --coverage      # Tests con cobertura
```

## Tests
- Pruebas unitarias e integradas con Jest
- Cobertura: ver reporte en carpeta `coverage/` o en consola tras ejecutar tests
- Validación de lógica de proxy, reintentos, timeouts y handlers de errores

## Producción
```bash
npm run build
npm start
```

## Ejemplo de uso desde frontend
```js
// Crear pedido
await fetch('http://localhost:3000/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ table: 5, products: [{ id: 'p1', qty: 2 }] })
});

// Obtener pedidos
const res = await fetch('http://localhost:3000/orders');
const orders = await res.json();

// Obtener vista de cocina
const kitchen = await fetch('http://localhost:3000/kitchen');
```

## Proxy y estrategia de handlers

El ProxyService reenvía peticiones al microservicio destino, aplicando timeout y reintentos. Los handlers gestionan errores específicos (Timeout, ConnectionRefused, etc) y formatean la respuesta de forma uniforme. Para agregar un nuevo handler, crea la clase en `src/handlers/` y regístrala en el middleware de errores antes del handler por defecto.

---

¿Dudas? Consulta la documentación o revisa los tests incluidos para ejemplos de uso y extensión.

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

## Cómo funciona el proxy y la estrategia de handlers (explicación puntual)

Proxy (qué hace y flujo)
- El ProxyService actúa como reenvío transparente: recibe la petición del gateway, la transforma a una petición HTTP hacia el microservicio destino (Python-MS o Node-MS), aplica timeout y reintentos, y devuelve la respuesta (normalmente response.data).
- Flujo simple:
  1. Controller recibe la petición del cliente.
  2. Llama al ProxyService correspondiente (OrdersProxyService / KitchenProxyService).
  3. ProxyService arma la petición (método, headers, body, timeout).
  4. Ejecuta la petición con retryWithBackoff si hay fallos temporales.
  5. Devuelve la respuesta al controller o lanza un error para que lo maneje el middleware de errores.
- Consideraciones: el proxy debe centralizar timeouts, reintentos y mapping de errores para mantener consistencia entre microservicios.

Strategy con handlers (qué son y cómo funcionan)
- Cada "handler" es una clase que implementa IErrorHandler con dos métodos principales:
  - canHandle(error): boolean — indica si ese handler sabe procesar este error.
  - handle(error, res): void — formatea la respuesta HTTP adecuada y la envía.
- En el middleware de errores hay una lista ordenada de handlers que se evalúa en orden de prioridad. El primer handler cuyo canHandle devuelve true se ejecuta.
- UnknownErrorHandler siempre debe estar al final: actúa como fallback para errores no previstos.

Cómo añadir un nuevo código de error (ej.: 429 Rate Limit)
- Crear un handler nuevo en `src/handlers/` que implemente IErrorHandler.
- Registrar (instanciar) ese handler en la lista `errorHandlers` del middleware `src/middlewares/errorHandler.ts` **antes** de `UnknownErrorHandler`.
- No modificar la lógica del middleware; solo añadir el handler en la lista mantiene el orden y la prioridad.

Ejemplo mínimo (handler 429)
```typescript
// filepath: d:\empresas22\sofka\taller 3\SistemaDePedidosRestaurante\api-gateway\src\handlers\RateLimitErrorHandler.ts
import { IErrorHandler } from '../interfaces/IErrorHandler';
import { Response } from 'express';

export class RateLimitErrorHandler implements IErrorHandler {
  canHandle(err: any): boolean {
    return err?.response?.status === 429 || err?.code === 'RATE_LIMIT';
  }

  handle(err: any, res: Response): void {
    res.status(429).json({
      success: false,
      code: 'RATE_LIMIT',
      message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.'
    });
  }
}
```

Dónde registrar el handler (middleware)
- Abrir `src/middlewares/errorHandler.ts` y añadir la instancia:
```ts
// antes de UnknownErrorHandler en la lista errorHandlers
new RateLimitErrorHandler(),
```

Buenas prácticas rápidas
- Preferible: mantener handlers pequeños y enfocados (una condición por handler).
- Tests: crear tests unitarios para canHandle() y handle() de cada handler.
- Para seguir OCP: si la lista de handlers crece, considera un registro dinámico (registerErrorHandler) en vez de editar el array cada vez.

Con esto tu compañera podrá entender exactamente cómo extiender el manejo de errores y cómo funciona el proxy sin tocar la lógica central del middleware.
