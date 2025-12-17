# Plantilla Contexto de Negocio

## 1. Descripción del Proyecto
**Nombre del Proyecto:** Sistema distribuido de gestión de pedidos para restaurantes de comidas rápidas

**Objetivo del Proyecto:**
Establecer un sistema distribuido de gestión de pedidos robusto, escalable y mantenible, que permita la automatización del flujo de trabajo de un restaurante. Esto incluye garantizar la comunicación eficiente y en tiempo real entre los meseros y la cocina, la persistencia segura de los datos de pedidos en MongoDB y la aplicación de principios de Clean Code y patrones de diseño.

## 2. Flujos Críticos del Negocio
**Principales Flujos de Trabajo:**
- Toma de Pedido (Mesero)
- Procesamiento de Pedido (Backend Python)
- Recepción y Simulación de Preparación (Backend Node.js)
- Visualización y Gestión en Cocina (Frontend de Cocina)
- Edición de Pedidos (Mesero)

**Módulos o Funcionalidades Críticas:**
- Frontend de Toma de Pedidos (Mesero)
- Backend de Pedidos Python (Validación y publicación de órdenes)
- Backend de Cocina Node.js (Consumo de pedidos, simulación de preparación, gestión de estado y notificaciones WebSocket)
- Servidor WebSocket (Comunicación en tiempo real con Cocina)
- RabbitMQ (Comunicación asíncrona)
- MongoDB (Persistencia de pedidos)
- API Gateway (Punto de entrada único, enrutamiento)

## 3. Reglas de Negocio y Restricciones
**Reglas de Negocio Relevantes:**
- El botón "Enviar Pedido" solo se habilita si hay productos y el nombre del cliente (customerName) no está vacío.
- El sistema debe requerir el nombre del cliente y el número de mesa para cada pedido.
- La edición de un pedido está permitida solo si su estado es "Pendiente". Si está "En Preparación" o "Listo", la edición no es permitida.
- Los pedidos en cocina deben estar organizados por estados: "Pendiente", "En Preparación", "Listo", "Completado".
- La lógica de cálculo del tiempo de preparación debe usar el patrón Strategy, cargando estrategias dinámicamente desde MongoDB.
- El API Gateway debe redirigir /api/orders/* al microservicio Python y /api/kitchen/* al microservicio Node.js.
- Regulaciones o Normativas: [Información no disponible en la trascripción]

## 4. Perfiles de Usuario y Roles
**Perfiles o Roles de Usuario en el Sistema:**
- Mesero (Utiliza el Frontend de Toma de Pedidos)
- Cocinero (Utiliza el Frontend de Cocina)

**Permisos y Limitaciones de Cada Perfil:**
- Mesero: Puede tomar pedidos, seleccionar productos, agregar notas, ingresar nombre de cliente/mesa y enviar pedidos. Puede editar pedidos solo si el estado es "Pendiente".
- Cocinero: Puede visualizar y gestionar los pedidos en tiempo real (ver estados: Pendiente, En Preparación, Listo, Completado) y cambiar el estado de un pedido (ej. con un clic).
- Limitación general: Falta de un sistema completo de autenticación y autorización.

## 5. Condiciones del Entorno Técnico
**Plataformas Soportadas:**
- Frontend de Mesero: Tablet (implícito por el uso de la interfaz de toma de pedidos).
- Desarrollo/Despliegue: Se ejecutan los microservicios y el frontend dentro de un único contenedor Docker compuesto.

**Tecnologías o Integraciones Clave:**
- Frontend: React, TypeScript
- Backend Python: Python, FastAPI
- Backend Node.js: Node.js, Express, TypeScript
- Message Broker: RabbitMQ (incluye Dead Letter Queue - DLQ)
- Base de Datos: MongoDB
- Comunicación en tiempo real: WebSockets
- Arquitectura/Patrones: Microservicios, API Gateway (patrón Proxy), SOLID, Strategy, Repository, Singleton.

## 6. Casos Especiales o Excepciones (Opcional)
**Escenarios Alternos o Excepciones que Deben Considerarse:**
- Manejo de errores en la mensajería: Los mensajes fallidos en el worker de Node.js deben ser enviados a una Dead Letter Queue (orders.failed).
- Edición de Pedidos: Solo permitida si el estado es "Pendiente".
- Ausencia de pedidos: El Backend Node.js emite un evento QUEUE_EMPTY cuando no hay pedidos pendientes.
- Recepción de un pedido existente: Se actualiza la orden en MongoDB y se notifica a los clientes (probablemente la vista de cocina).
- Limitación: Falta de manejo de concurrencia para la asignación de pedidos a mesas por múltiples meseros.
