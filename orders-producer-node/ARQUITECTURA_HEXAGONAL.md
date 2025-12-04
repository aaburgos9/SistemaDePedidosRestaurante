# Arquitectura Hexagonal en SistemaDePedidosRestaurante

## ¿Qué es la Arquitectura Hexagonal?

La arquitectura hexagonal ("Ports and Adapters") separa la lógica de negocio de las preocupaciones técnicas, organizando el código en capas con dependencias que apuntan hacia el centro (el dominio).

---

## Las 3 Capas del Proyecto

### 1. DOMAIN (Dominio - El Núcleo)

**Ubicación:** `src/domain/`

**¿Qué es?** El corazón de la aplicación. Contiene la lógica de negocio pura, independiente de frameworks, bases de datos o tecnologías externas.

**¿Qué contiene?**
- **Models:** Entidades del negocio (Order, Product, PreparationTime)
- **Interfaces:** Contratos que definen los puertos del dominio (ej: `OrderRepository`)
- **Strategies:** Algoritmos y reglas de negocio complejas

**Regla de oro:** NO debe depender de nada externo (no imports de Express, MongoDB, RabbitMQ, etc.)

---

### 2. APPLICATION (Aplicación - Casos de Uso)

**Ubicación:** `src/application/`

**¿Qué es?** La capa orquestadora. Define cómo se usan las reglas del dominio para resolver casos de uso específicos.

**¿Qué contiene?**
- **Factories:** Construcción de objetos del dominio con lógica específica
- **Config:** Configuración y ensamblaje de componentes del dominio

**Regla de oro:** Puede depender del Domain, pero NO de Infrastructure. Orquesta casos de uso.

---

### 3. INFRASTRUCTURE (Infraestructura - Adaptadores)

**Ubicación:** `src/infrastructure/`

**¿Qué es?** Los adaptadores concretos que conectan el dominio con el mundo exterior (bases de datos, APIs, mensajería, etc.).

**¿Qué contiene?**
- **Database:** Implementaciones concretas de los puertos del dominio (ej: `MongoOrderRepository`)
- **HTTP:** Adaptadores REST (controladores Express)
- **Messaging:** Adaptadores de mensajería (RabbitMQ)
- **WebSocket:** Adaptadores de tiempo real

**Regla de oro:** Implementa los puertos del Domain y depende de tecnologías específicas.

---

## Flujo de Dependencias

```
┌─────────────────────────────────────┐
│         INFRASTRUCTURE              │
│  (HTTP, DB, Messaging, WebSocket)   │
│         Adapters ↓                  │
└─────────────────┬───────────────────┘
                  │ implementa
                  ↓
┌─────────────────────────────────────┐
│          APPLICATION                │
│   (Factories, Config, Use Cases)    │
│         Orchestration ↓             │
└─────────────────┬───────────────────┘
                  │ usa
                  ↓
┌─────────────────────────────────────┐
│            DOMAIN                   │
│  (Models, Interfaces, Strategies)   │
│         Business Logic              │
└─────────────────────────────────────┘
```

Las flechas apuntan hacia el dominio, nunca al revés.

---

## ¿Por qué esta arquitectura?

- **Testabilidad:** Puedes testear el dominio sin base de datos real
- **Independencia de frameworks:** Si cambias Express por Fastify, solo tocas `infrastructure/http/`
- **Mantenibilidad:** La lógica de negocio está aislada y clara
- **Escalabilidad:** Puedes agregar nuevos adaptadores sin tocar el dominio

---

## Ejemplo Práctico del Flujo

Cuando llega un pedido nuevo por RabbitMQ:

1. `infrastructure/messaging/worker.ts` recibe el mensaje
2. `application/factories/order.factory.ts` convierte el mensaje a `KitchenOrder`
3. `infrastructure/http/controllers/kitchen.controller.ts` llama a `addKitchenOrder()`
4. `infrastructure/database/repositories/mongo.order.repository.ts` guarda en MongoDB implementando `OrderRepository` (Domain)
5. `infrastructure/websocket/ws-server.ts` notifica a clientes conectados

Cada capa tiene su responsabilidad clara y puede evolucionar independientemente. ¡Eso es la magia de la arquitectura hexagonal! 🎨
