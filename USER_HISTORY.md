# 📋 Epic: Separación de Vistas Mesero/Cocina

**Objetivo:** Dividir la vista actual en dos vistas independientes para mejorar la experiencia de usuario según el rol.

---

## HU-001: Navegación entre Vistas

**Como** usuario del sistema
**Quiero** poder seleccionar entre la vista de Mesero y la vista de Cocina
**Para** acceder únicamente a las funcionalidades relevantes a mi rol

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-001.1** | Debe existir una pantalla inicial con dos botones: "Soy Mesero" y "Soy Cocina" |
| **CA-001.2** | La URL debe reflejar la vista actual (`/mesero`, `/cocina`) |
| **CA-001.3** | Debe existir un enlace/botón para volver a la pantalla inicial desde cada vista |

---

## HU-002: Vista del Mesero (Toma de Pedidos)

**Como** mesero  
**Quiero** una vista dedicada para tomar pedidos  
**Para** concentrarme en atender a los clientes sin distracciones

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-002.1** | Mostrar catálogo de productos disponibles |
| **CA-002.2** | Permitir agregar productos al carrito con cantidad |
| **CA-002.3** | Permitir agregar notas/comentarios a cada producto |
| **CA-002.4** | Mostrar resumen del pedido actual (sidebar o sección) |
| **CA-002.5** | Campos obligatorios: nombre del cliente y número de mesa |
| **CA-002.6** | Botón "Enviar Pedido" que conecta con backend Python |
| **CA-002.7** | Mostrar mensaje de éxito o error tras enviar |
| **CA-002.8** | Limpiar carrito después de envío exitoso |

---

## HU-003: Vista de Cocina (Gestión de Pedidos)

**Como** cocinero  
**Quiero** una vista dedicada para ver y gestionar los pedidos entrantes  
**Para** concentrarme en preparar los platos eficientemente

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-003.1** | Conectarse via WebSocket al backend Node.js |
| **CA-003.2** | Mostrar pedidos en tiempo real |
| **CA-003.3** | Organizar pedidos en columnas por estado: "Pendiente", "En Preparación", "Listo" |
| **CA-003.4** | Permitir cambiar estado de un pedido con un clic |

---

## HU-004: Utilidades Compartidas

**Como** desarrollador  
**Quiero** tener funciones utilitarias centralizadas  
**Para** evitar duplicación de código entre vistas

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-004.1** | Crear `utils/currency.ts` con función `formatCOP()` |
| **CA-004.2** | Crear `types/order.ts` con interfaces compartidas (`Order`, `OrderItem`, `OrderStatus`) |
| **CA-004.3** | Crear `config/constants.ts` con URLs de APIs y configuraciones |
| **CA-004.4** | Cero duplicación de código entre vistas |

---

# 📋 Epic: Migración a MongoDB (orders-producer-node)

**Objetivo:** Migrar la persistencia de pedidos desde memoria a MongoDB para garantizar persistencia, escalabilidad y trazabilidad.

---

## HU-005: Migración de Persistencia a MongoDB

**Como** desarrollador del servicio Node  
**Quiero** migrar la persistencia de pedidos desde memoria a MongoDB  
**Para** garantizar que los datos sobrevivan reinicios y escalen correctamente

### Criterios de Aceptación Generales

| ID | Criterio |
|---|---|
| **CA-005.1** | El servicio se conecta a MongoDB usando variable de entorno `MONGO_URI` |
| **CA-005.2** | Manejo claro de errores cuando la conexión falla |
| **CA-005.3** | Existe interfaz `OrderRepository` que declara métodos CRUD |
| **CA-005.4** | Los controladores dependen de la interfaz, no de la implementación concreta (DIP) |
| **CA-005.5** | `OrderMessage` y `OrderItem` mantienen compatibilidad con modelo actual |
| **CA-005.6** | Secretos/URI no expuestos en repositorio |

### Definición de Hecho (DoD) General

* [ ] Patrón Repository implementado  
* [ ] Servicio arranca con MongoDB  
* [ ] Tests unitarios pasan  
* [ ] README actualizado  
* [ ] Variables de entorno documentadas

---

## HT-001: Definir Contrato OrderRepository (Interfaz)

**Como** desarrollador  
**Quiero** definir una interfaz `OrderRepository`  
**Para** desacoplar la lógica de negocio de la implementación de persistencia

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-HT001.1** | Crear interfaz `OrderRepository` en `src/repositories/OrderRepository.ts` |
| **CA-HT001.2** | Métodos definidos: `create`, `getById`, `list`, `update`, `delete` |
| **CA-HT001.3** | Interfaz documentada con JSDoc/TSDoc |
| **CA-HT001.4** | Crear implementación mock `InMemoryOrderRepository` para tests |

### Definición de Hecho (DoD)

* [ ] Interfaz creada y exportada  
* [ ] Tipos de entrada/salida definidos  
* [ ] Mock funcional para testing  
* [ ] Tests que validan uso desde controladores con mock

### Firma Esperada

```typescript
interface OrderRepository {
  create(order: CreateOrderDTO): Promise<Order>;
  getById(id: string): Promise<Order | null>;
  list(options?: ListOptions): Promise<PaginatedResult<Order>>;
  update(id: string, data: Partial<Order>): Promise<Order | null>;
  delete(id: string): Promise<boolean>;
}
```

---

## HT-002: Implementar MongoOrderRepository

**Como** desarrollador  
**Quiero** implementar `MongoOrderRepository`  
**Para** persistir pedidos en MongoDB cumpliendo el contrato definido

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-HT002.1** | Clase `MongoOrderRepository` implementa `OrderRepository` |
| **CA-HT002.2** | Persiste en colección `orders` |
| **CA-HT002.3** | Método `create` genera `_id` y timestamps automáticos |
| **CA-HT002.4** | Método `list` soporta paginación básica (`limit`, `skip`) |
| **CA-HT002.5** | Método `update` realiza actualización parcial |
| **CA-HT002.6** | Conexión configurable via `MONGO_URI` |

### Definición de Hecho (DoD)

* [ ] Implementación completa de los 5 métodos CRUD  
* [ ] Tests unitarios con MongoDB en memoria (mongodb-memory-server) o mocks  
* [ ] Manejo de errores de conexión

### Estructura Esperada

```
src/
├── repositories/
│   ├── OrderRepository.ts         # Interfaz
│   ├── InMemoryOrderRepository.ts # Mock/tests
│   └── MongoOrderRepository.ts    # Implementación real
```

---

## HT-003: Configuración e Inyección de Dependencias

**Como** desarrollador  
**Quiero** configurar la inyección del repositorio MongoDB  
**Para** que el servicio use persistencia real en producción

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-HT003.1** | Variable de entorno `MONGO_URI` leída desde `.env` |
| **CA-HT003.2** | Servicio arranca con `MongoOrderRepository` inyectado |
| **CA-HT003.3** | Fallback o error claro si `MONGO_URI` no está definida |
| **CA-HT003.4** | Controladores reciben repositorio por constructor/DI |
| **CA-HT003.5** | README actualizado con ejemplo de configuración |

### Definición de Hecho (DoD)

* [ ] Variables de entorno documentadas  
* [ ] DI configurada  
* [ ] Startup funcional con MongoDB

---

## HT-004: Integrar Patrón Repository en Controladores

**Como** desarrollador  
**Quiero** integrar `OrderRepository` en los controladores existentes  
**Para** usar persistencia MongoDB en lugar de memoria

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-HT004.1** | Controladores reciben `OrderRepository` via inyección de dependencias |
| **CA-HT004.2** | Controlador `POST /orders` persiste en MongoDB via `repository.create()` |
| **CA-HT004.3** | Controlador `GET /orders/:id` lee desde MongoDB |
| **CA-HT004.4** | Controlador `GET /orders` lista pedidos desde MongoDB |
| **CA-HT004.5** | Controlador `PATCH /orders/:id` actualiza pedidos |
| **CA-HT004.6** | Manejo de errores consistente |

### Definición de Hecho (DoD)

* [ ] Controladores usan repositorio  
* [ ] Tests de controladores pasan  
* [ ] Código limpio sin acoplamiento directo a MongoDB

---

## HT-005: Tests de Integración con MongoDB

**Como** QA/Desarrollador  
**Quiero** tener tests de integración que validen persistencia  
**Para** garantizar que MongoDB funciona correctamente en el flujo completo

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-HT005.1** | Tests usan `mongodb-memory-server` o contenedor temporal |
| **CA-HT005.2** | Test E2E: crear pedido → persiste → recuperar → verificar |
| **CA-HT005.3** | Test: crear múltiples pedidos → listar → verificar paginación |
| **CA-HT005.4** | Test: actualizar estado de pedido → verificar persistencia |
| **CA-HT005.5** | Test: conexión fallida → manejo adecuado |

### Definición de Hecho (DoD)

* [ ] Suite de tests de integración funcional  
* [ ] Cobertura > 80%  
* [ ] Tests ejecutables en CI/CD

---

## HT-006: Migración de Datos y Backward Compatibility

**Como** DevOps  
**Quiero** asegurar compatibilidad con el modelo de datos actual  
**Para** evitar breaking changes en otros servicios

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-HT006.1** | Esquema MongoDB compatible con modelo `OrderMessage` actual |
| **CA-HT006.2** | Timestamps (`createdAt`, `updatedAt`) gestionados por MongoDB |
| **CA-HT006.3** | IDs compatibles con formato UUID |
| **CA-HT006.4** | Script de migración disponible si hay datos legacy |

### Definición de Hecho (DoD)

* [ ] Esquema validado  
* [ ] Compatibilidad verificada  
* [ ] Documentación de migración

---

# 📋 Epic: API Gateway (Orquestador de Microservicios)

**Objetivo:** Crear un microservicio API Gateway que actúe como punto único de entrada y orquestador para los microservicios existentes (Python-MS y Node-MS), aplicando principios SOLID, Clean Code y el patrón Proxy.

---

## HU-006: API Gateway - Enrutamiento y Orquestación

**Como** desarrollador del sistema  
**Quiero** implementar un API Gateway que actúe como proxy y orquestador  
**Para** centralizar el acceso a los microservicios y mejorar la mantenibilidad del sistema

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-006.1** | El API Gateway debe exponerse en el puerto `3000` |
| **CA-006.2** | Debe implementar el patrón Proxy para redireccionar peticiones a los microservicios backend |
| **CA-006.3** | Debe enrutar `/api/orders/*` al microservicio Python (puerto 8000) |
| **CA-006.4** | Debe enrutar `/api/kitchen/*` al microservicio Node.js (puerto 3002) |
| **CA-006.5** | Debe manejar errores de forma centralizada y devolver respuestas consistentes |
| **CA-006.6** | Debe incluir CORS configurado para permitir peticiones del frontend |
| **CA-006.7** | Debe registrar (logging) todas las peticiones entrantes y salientes |

---

## HU-007: Arquitectura SOLID y Clean Code

**Como** desarrollador del sistema  
**Quiero** que el API Gateway siga principios SOLID y Clean Code  
**Para** garantizar código mantenible, escalable y de calidad

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-007.1** | **SRP**: Cada clase/módulo debe tener una única responsabilidad (Router, ProxyService, ErrorHandler) |
| **CA-007.2** | **OCP**: El sistema debe ser extensible sin modificar código existente (agregar nuevas rutas sin tocar las existentes) |
| **CA-007.3** | **LSP**: Las implementaciones de servicios proxy deben ser intercambiables |
| **CA-007.4** | **ISP**: Interfaces segregadas por funcionalidad (IProxyService, IErrorHandler) |
| **CA-007.5** | **DIP**: Depender de abstracciones, no de implementaciones concretas (usar inyección de dependencias) |
| **CA-007.6** | Nombres de variables y funciones descriptivos en inglés |
| **CA-007.7** | Funciones pequeñas con máximo 20 líneas de código |
| **CA-007.8** | Separación clara de capas: Routes → Controllers → Services → Utils |

---

## HU-008: Implementación del Patrón Proxy

**Como** arquitecto del sistema  
**Quiero** implementar el patrón Proxy correctamente  
**Para** interceptar, controlar y modificar las peticiones antes de llegar a los microservicios

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-008.1** | Crear interfaz `IProxyService` con métodos `forward()` y `handleResponse()` |
| **CA-008.2** | Implementar `OrdersProxyService` para el microservicio Python |
| **CA-008.3** | Implementar `KitchenProxyService` para el microservicio Node.js |
| **CA-008.4** | El proxy debe interceptar peticiones y agregar headers personalizados (X-Gateway-Request-ID, X-Forwarded-For) |
| **CA-008.5** | El proxy debe transformar respuestas en un formato estándar |
| **CA-008.6** | Implementar timeout de 30 segundos para peticiones a microservicios |
| **CA-008.7** | Implementar retry logic con exponential backoff (3 intentos máximo) |
| **CA-008.8** | Cachear respuestas de health checks por 10 segundos |

---

## HU-009: Suite de Tests Automatizados

**Como** desarrollador del sistema  
**Quiero** tener tests automatizados completos  
**Para** garantizar la calidad y funcionamiento del API Gateway

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-009.1** | Cobertura mínima de tests: 80% |
| **CA-009.2** | **Tests Unitarios**: Probar cada servicio proxy de forma aislada con mocks |
| **CA-009.3** | **Tests de Integración**: Probar rutas completas con microservicios simulados |
| **CA-009.4** | **Tests de Health Check**: Verificar respuestas cuando servicios están UP/DOWN |
| **CA-009.5** | **Tests de Manejo de Errores**: Verificar respuestas 404, 500, 503 |
| **CA-009.6** | **Tests de Timeout**: Simular servicios lentos y verificar timeout |
| **CA-009.7** | **Tests de Retry Logic**: Verificar reintentos ante fallos temporales |
| **CA-009.8** | Usar Jest como framework de testing |
| **CA-009.9** | Incluir script `npm test` en package.json |
| **CA-009.10** | Tests deben ejecutarse en CI/CD antes de hacer deploy |

---

## HU-010: Configuración y Variables de Entorno

**Como** DevOps/Desarrollador  
**Quiero** configurar el API Gateway mediante variables de entorno  
**Para** facilitar el despliegue en diferentes ambientes (dev, staging, prod)

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-010.1** | Crear archivo `.env.example` con todas las variables necesarias |
| **CA-010.2** | Variable `PORT` para el puerto del gateway (default: 3000) |
| **CA-010.3** | Variable `PYTHON_MS_URL` para la URL del microservicio Python |
| **CA-010.4** | Variable `NODE_MS_URL` para la URL del microservicio Node.js |
| **CA-010.5** | Variable `LOG_LEVEL` (debug, info, warn, error) |
| **CA-010.6** | Variable `REQUEST_TIMEOUT` en milisegundos |
| **CA-010.7** | Variable `RETRY_ATTEMPTS` (número de reintentos) |
| **CA-010.8** | Validar que todas las variables requeridas existan al iniciar |

---


## HU-011: Refactorización y Mejora del Microservicio de Pedidos (Python)

**Como** desarrollador backend
**Quiero** que el microservicio de pedidos en Python siga principios SOLID, Clean Code y aplique un patrón de diseño adecuado
**Para** mejorar la mantenibilidad, escalabilidad y calidad del código, y permitir la edición de órdenes siempre que no estén en estado "preparando"

### Criterios de Aceptación

| ID | Criterio |
|---|---|
| **CA-011.1** | El código debe estar refactorizado aplicando principios SOLID y Clean Code (SRP, OCP, DIP, funciones pequeñas, nombres claros, etc.) |
| **CA-011.2** | Debe implementarse al menos un patrón de diseño relevante (por ejemplo, Repository, Adapter o Strategy) |
| **CA-011.3** | Se debe permitir editar una orden solo si su estado NO es "preparando" |
| **CA-011.4** | Deben existir pruebas unitarias para la funcionalidad de edición y validación de reglas de negocio |
| **CA-011.5** | La documentación del código y README deben reflejar los cambios realizados |