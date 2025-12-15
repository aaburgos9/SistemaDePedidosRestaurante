Cocina en Tiempo Real con RabbitMQ y WebSocket

Este proyecto implementa un sistema de cocina en tiempo real, que consume pedidos desde una cola de RabbitMQ, procesa los tiempos de preparación y notifica a un frontend mediante WebSocket sobre el estado de los pedidos.

src/
├─ amqp.ts               # Configuración de la conexión AMQP (RabbitMQ)
├─ controllers/
│  └─ kitchen.controller.ts   # Gestión de pedidos en cocina
├─ models/
│  └─ order.ts           # Interfaces de pedidos y items
├─ worker.ts             # Worker que procesa pedidos desde RabbitMQ
├─ wsServer.ts           # Servidor WebSocket para notificaciones en tiempo real
├─ index.ts              # Servidor Express principal

Funcionamiento

Worker (worker.ts)
Escucha la cola orders.new en RabbitMQ.
Calcula el tiempo total de preparación según los productos.
Cambia el estado de los pedidos de preparing a ready.
Notifica al frontend vía WebSocket sobre:
ORDER_NEW: pedido en preparación.
ORDER_READY: pedido listo.
QUEUE_EMPTY: cola vacía, esperando nuevos pedidos.

Controlador de Cocina (kitchen.controller.ts)
Guarda pedidos en memoria (pedidosEnCocina).
Permite consultar los pedidos actuales vía endpoint /kitchen/orders.

WebSocket (wsServer.ts)
Envía notificaciones en tiempo real a todos los clientes conectados.

Frontend
Visualiza solo el pedido en curso.
Muestra un mensaje: 🕒 Esperando nuevos pedidos... cuando la cola está vacía.
Muestra: ID, cliente, mesa, items, estado y tiempo estimado.

🟢 Endpoints disponibles

GET /kitchen/orders
Devuelve los pedidos en cocina y su estado:
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


⏱ Tiempos de preparación

Los tiempos por producto están definidos en worker.ts:
const tiempos: Record<string, number> = {
  hamburguesa: 10,
  "papas fritas": 4,
  "perro caliente": 6,
  refresco: 2,
};


⚙️ Configuración de RabbitMQ

El proyecto soporta dos tipos de conexión:
Local (ej. 127.0.0.1:5672)
CloudAMQP (ej. woodpecker.rmq.cloudamqp.com:5671)
Para configurarlas, crea un archivo .env en la raíz del proyecto

🚀 Instalación y ejecución

1. Clonar el repositorio:
git clone <repo-url>
cd <project-folder>

2. Instalar dependencias:
npm install

3. Configurar variables de entorno en .env (ver sección anterior).
4. Iniciar el servidor:
npm run dev

Esto levantará:

Express en el puerto 3002
WebSocket en el puerto 4000
Worker escuchando la cola de RabbitMQ

📈 Flujo de datos

flowchart LR
    A[Pedido nuevo] -->|publica| B(RabbitMQ orders.new)
    B -->|consume| C[Worker de cocina]
    C -->|notifica| D[WebSocket server]
    D -->|actualiza| E[Frontend en tiempo real]


📝 Notas

Solo se procesa un pedido a la vez (channel.prefetch(1)).
Cuando no hay pedidos en la cola, el frontend muestra: "🕒 Esperando nuevos pedidos...".
Los pedidos se almacenan temporalmente en memoria (pedidosEnCocina).
