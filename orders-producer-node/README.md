src/
├─ amqp.ts               # Configuración de la conexión AMQP (RabbitMQ)
├─ controllers/
│  └─ kitchen.controller.ts   # Gestión de pedidos en cocina
├─ models/
│  └─ order.ts           # Interfaces de pedidos y items
├─ worker.ts             # Worker que procesa pedidos desde RabbitMQ
├─ wsServer.ts           # Servidor WebSocket para notificaciones en tiempo real
├─ index.ts              # Servidor Express principal

# Orders Producer Node — Cocina en Tiempo Real

Servicio backend para la gestión de pedidos en cocina, consumo de RabbitMQ y notificaciones en tiempo real vía WebSocket.

- Puerto Express: 3002
- Puerto WebSocket: 4000
- Broker: RabbitMQ (local o CloudAMQP)
- Testing: Jest (si aplica)

## Estructura del Proyecto
```
orders-producer-node/
├── Dockerfile           # Imagen para despliegue en contenedores
├── package.json         # Dependencias y scripts del proyecto
├── tsconfig.json        # Configuración de TypeScript
├── src/                 # Código fuente principal
│   ├── amqp.ts          # Configuración de conexión a RabbitMQ
│   ├── controllers/     # Controladores HTTP (kitchen)
│   ├── models/          # Modelos y tipos de pedidos
│   ├── worker.ts        # Worker que consume la cola y procesa pedidos
│   ├── wsServer.ts      # Servidor WebSocket para notificaciones
│   └── index.ts         # Servidor Express principal
└── test-utils/          # Utilidades y mocks para pruebas
```

Cada archivo/carpeta cumple una función específica:
- **Dockerfile**: Permite crear la imagen Docker para despliegue.
- **package.json**: Lista dependencias, scripts y metadatos.
- **tsconfig.json**: Opciones de compilación TypeScript.
- **src/amqp.ts**: Configuración y conexión a RabbitMQ.
- **src/controllers/**: Controladores HTTP (kitchen).
- **src/models/**: Modelos y tipos de pedidos.
- **src/worker.ts**: Worker que consume la cola y procesa pedidos.
- **src/wsServer.ts**: Servidor WebSocket para notificaciones en tiempo real.
- **src/index.ts**: Arranque del servidor Express.
- **test-utils/**: Utilidades y mocks para pruebas.

## Endpoints

**Cocina**
- GET /kitchen/orders  → Devuelve los pedidos en cocina y su estado actual

Ejemplo de respuesta:
[
  {
    "id": "52af8779-09ba-40fa-98a4-3e3b04d6cf25",
    "customerName": "Jessica S",
    "table": "Mesa 3",
    "items": [
      { "productName": "Hamburguesa sencilla", "quantity": 2, "unitPrice": 18000 },
      { "productName": "Limonada natural", "quantity": 1, "unitPrice": 8000 }
    ],
    "createdAt": "2025-11-20T20:40:22.667468",
    "status": "preparing"
  }
]

## Variables de entorno
```
RABBITMQ_URL=amqp://localhost:5672
EXPRESS_PORT=3002
WS_PORT=4000
```

## Desarrollo
```bash
npm install
npm run dev
```

## Tests
- (Opcional) Pruebas unitarias e integración (estructura sugerida en test-utils/)

## Producción
```bash
npm run build
npm start
```

## Funcionamiento

1. El worker (`src/worker.ts`) escucha la cola `orders.new` en RabbitMQ, calcula el tiempo de preparación y actualiza el estado del pedido.
2. Notifica al frontend vía WebSocket (`src/wsServer.ts`) sobre:
   - ORDER_NEW: pedido en preparación
   - ORDER_READY: pedido listo
   - QUEUE_EMPTY: esperando nuevos pedidos
3. El controlador de cocina (`src/controllers/kitchen.controller.ts`) permite consultar los pedidos actuales vía `/kitchen/orders`.
4. Los pedidos se almacenan temporalmente en memoria.

## Tiempos de preparación
Los tiempos por producto están definidos en `src/worker.ts`:
```ts
const tiempos: Record<string, number> = {
  hamburguesa: 10,
  "papas fritas": 4,
  "perro caliente": 6,
  refresco: 2,
};
```

## Notas
- Solo se procesa un pedido a la vez (`channel.prefetch(1)`).
- Cuando no hay pedidos en la cola, el frontend muestra: "🕒 Esperando nuevos pedidos...".
- Los pedidos se almacenan temporalmente en memoria (`pedidosEnCocina`).
