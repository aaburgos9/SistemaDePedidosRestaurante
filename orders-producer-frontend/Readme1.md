# Arquitectura del Sistema — SistemaDePedidosRestaurante

Diagrama general (Mermaid):

```mermaid
flowchart LR
  User[Mesero / Tablet] -->|UI / clicks| Frontend[Frontend (React + Vite)\norders-producer-frontend/src/App.tsx]
  Frontend -->|POST /api/v1/orders| ProducerAPI[Producer API (FastAPI)\norders-producer-python/app/main.py]
  ProducerAPI -->|publica mensaje| RabbitMQ[(RabbitMQ)]
  RabbitMQ -->|consume| Worker[Worker de Cocina (Node)\norders-producer-node/src/worker.ts]
  Worker -->|notifica via WS| WS[(WebSocket Server)\norders-producer-node/src/wsServer.ts]
  WS -->|actualiza UI cocina| KitchenUI[Frontend Cocina (fake)\norders-producer-node/src/fake-front-cocina.html]
  note right of ProducerAPI: Pydantic models y servicios\norders-producer-python/app/models/order.py\norders-producer-python/app/services/order_service.py
```

Resumen de capas y responsabilidades
- Frontend (orders-producer-frontend)
  - UI para tomar pedidos y vista de cocina. Componentes principales:
    - [`App`](orders-producer-frontend/src/App.tsx)
    - [`OrderSidebar`](orders-producer-frontend/src/components/OrderSidebar.tsx)
    - [`ProductCard`](orders-producer-frontend/src/components/ProductCard.tsx)
  - Se encarga de construir el payload y enviar al endpoint: POST http://localhost:8000/api/v1/orders/

- Backend productor (orders-producer-python)
  - Controllers: reciben HTTP y validan entrada
    - [`create_order_endpoint`](orders-producer-python/app/controllers/order_controller.py)
  - Services: lógica de negocio y transformación a mensaje
    - [`create_order`](orders-producer-python/app/services/order_service.py) — crea OrderMessage y llama a publish
  - Messaging: abstracción para RabbitMQ
    - [`publish_order`, `init_rabbit`](orders-producer-python/app/messaging/messaging.py)
  - Models: validación con Pydantic / tipos
    - [`OrderItem`, `OrderIn`, `OrderMessage`](orders-producer-python/app/models/order.py)

- Cola / Broker
  - RabbitMQ — transporte de mensajes (cola `orders.new`). No hay persistencia en BD en el repo.

- Worker de cocina (orders-producer-node)
  - Consume la cola (`orders.new`) usando AMQP (`amqplib`) y procesa pedidos
    - [`startWorker`](orders-producer-node/src/worker.ts)
  - Controlador en memoria de la cocina
    - [`kitchen.controller.ts`](orders-producer-node/src/controllers/kitchen.controller.ts) (almacena en memoria `pedidosEnCocina`)
  - Notificaciones en tiempo real via WebSocket
    - [`wsServer.ts`](orders-producer-node/src/wsServer.ts) — envía eventos ORDER_NEW / ORDER_READY a clientes

Controllers, Services, Repositories (breve)
- Controllers
  - Entradas HTTP / REST. Validación mínima y delegación a services.
  - Ejemplo: [`orders-producer-python/app/controllers/order_controller.py`](orders-producer-python/app/controllers/order_controller.py)
- Services
  - Lógica de creación de objeto de dominio, transformación y publicación.
  - Ejemplo: [`orders-producer-python/app/services/order_service.py`](orders-producer-python/app/services/order_service.py)
- Repositories
  - En este monorepo no hay capa de persistencia a BD:
    - Productor: publica a RabbitMQ (mensajería en vez de repositorio).
    - Cocina (node): mantiene pedidos en memoria (`pedidosEnCocina`) en [`kitchen.controller.ts`](orders-producer-node/src/controllers/kitchen.controller.ts).
  - Recomendación: agregar una capa `repository` si se requiere persistencia (Postgres/Mongo).

Dependencias clave y frameworks

| Parte | Framework / Paquete | Archivo que lo usa |
|---|---:|---|
| Frontend | React (v19.x) | [orders-producer-frontend/package.json](orders-producer-frontend/package.json) |
| Frontend | Vite | [orders-producer-frontend/vite.config.ts](orders-producer-frontend/vite.config.ts) |
| Frontend | TypeScript | [orders-producer-frontend/tsconfig.app.json](orders-producer-frontend/tsconfig.app.json) |
| Producer API | FastAPI | [orders-producer-python/app/main.py](orders-producer-python/app/main.py) |
| Producer API | Pydantic / pydantic-settings | [orders-producer-python/app/models/order.py](orders-producer-python/app/models/order.py) |
| Producer API | pika (RabbitMQ client) | [orders-producer-python/app/messaging/messaging.py](orders-producer-python/app/messaging/messaging.py) |
| Worker / Node | amqplib (AMQP) | [orders-producer-node/src/amqp.ts](orders-producer-node/src/amqp.ts) |
| Worker / Node | ws (WebSocket) | [orders-producer-node/src/wsServer.ts](orders-producer-node/src/wsServer.ts) |
| Worker / Node | Express (API cocina) | [orders-producer-node/src/index.ts](orders-producer-node/src/index.ts) |

Puntos de extensión / dónde cambiar precios en el frontend
- Valor visible: componente product card — [`ProductCard`](orders-producer-frontend/src/components/ProductCard.tsx) muestra `product.price`.
- Cálculo total / valor real enviado: [`App`](orders-producer-frontend/src/App.tsx) — `total` se calcula con `order.items.reduce((s,it) => s + it.price*it.qty, 0)` y el payload envía `unitPrice: it.price`.

Archivos clave (rápido acceso)
- Frontend: [orders-producer-frontend/src/App.tsx](orders-producer-frontend/src/App.tsx)  
- Order sidebar: [orders-producer-frontend/src/components/OrderSidebar.tsx](orders-producer-frontend/src/components/OrderSidebar.tsx)  
- Product card: [orders-producer-frontend/src/components/ProductCard.tsx](orders-producer-frontend/src/components/ProductCard.tsx)  
- Producer API: [orders-producer-python/app/main.py](orders-producer-python/app/main.py)  
- Producer models: [orders-producer-python/app/models/order.py](orders-producer-python/app/models/order.py)  
- Producer service: [orders-producer-python/app/services/order_service.py](orders-producer-python/app/services/order_service.py)  
- Worker: [orders-producer-node/src/worker.ts](orders-producer-node/src/worker.ts)  
- WebSocket: [orders-producer-node/src/wsServer.ts](orders-producer-node/src/wsServer.ts)

Notas rápidas de ejecución
- Frontend: desde la raíz del frontend:
  - cd orders-producer-frontend
  - npm install
  - npm run dev
- Producer API (Python): crear .env con CLOUDAMQP_URL o variables locales, luego:
  - cd orders-producer-python
  - pip install -r requirements.txt
  - uvicorn app.main:app --reload --port 8000
- Worker & WS (Node):
  - cd orders-producer-node
  - npm install
  - npm run dev

Si quieres, puedo:
- Actualizar este README con más detalles (endpoints, ejemplos de payload).
- Añadir diagrama más detallado por componente o secuencia de mensajes.

Frontend