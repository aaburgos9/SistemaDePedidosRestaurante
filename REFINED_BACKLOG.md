Gema usada para refinar las HU:
https://gemini.google.com/gem/565ef68c7783/621b5c45f884c8b0

# REFINED_BACKLOG.md

## 2.3.10. Historia de Usuario 10
**Identificador único (ID):** US-010

**Título:** Calcular y Simular Tiempo de Preparación de Pedido

**Descripción:** Como microservicio de cocina (Node.js), quiero calcular y simular el tiempo de preparación estimado para cada pedido, para gestionar el flujo de trabajo de la cocina de manera eficiente.

**Criterios de Aceptación:**

- **Escenario 1:** Cálculo del Tiempo de Preparación
  - Dado que un nuevo pedido es recibido,
  - Cuando el microservicio Node.js lo procesa,
  - Entonces calcula el tiempo de preparación usando el Strategy Pattern y cambia el estado del pedido a "preparing".
- **Escenario 2:** Finalización de la Preparación Simulada
  - Dado que un pedido está en estado "preparing",
  - Cuando el tiempo de preparación simulado finaliza,
  - Entonces el estado del pedido cambia a "ready".

**Prioridad / Orden en el Backlog:** Alta
**Feature:** FT-003 - Gestión de Pedidos en Cocina (Backend Node.js)
**Épica:** EP-001 - Automatización y Optimización de la Gestión de Pedidos
**Dependencias:** US-009, US-022, US-030
**Versión / Release:** 1.0

---


## 2.3.11. Historia de Usuario 11
**Identificador único (ID):** US-011

**Título:** Actualizar Pedido Existente y Notificar

**Descripción:** Como microservicio de cocina (Node.js), quiero poder actualizar un pedido existente si se recibe nuevamente, para reflejar cambios en la orden y notificar a los clientes sobre la modificación.

**Criterios de Aceptación:**

- **Escenario 1:** Procesamiento de Actualización de Pedido
  - Dado que el microservicio Node.js recibe un mensaje para un pedido con un ID ya existente,
  - Cuando procesa el mensaje de actualización,
  - Entonces actualiza la orden en MongoDB y emite un evento ORDER_UPDATED vía WebSocket.

**Prioridad / Orden en el Backlog:** Media
**Feature:** FT-003 - Gestión de Pedidos en Cocina (Backend Node.js)
**Épica:** EP-001 - Automatización y Optimización de la Gestión de Pedidos
**Dependencias:** US-009, US-017, US-021
**Versión / Release:** 1.1

---


## US-012
**Identificador único (ID):** US-012

**Título:** Autenticación y Control de Acceso por Roles

**Descripción:** Como usuario del sistema (Administrador, Mesero, Cocinero), quiero iniciar sesión de forma segura con mis credenciales y que el sistema asigne permisos según mi rol, para que solo el personal autorizado acceda a las funcionalidades correspondientes y se garantice la seguridad de la información.

**Criterios de Aceptación:**

- **Escenario 1:** Inicio de Sesión y Asignación de Rol
  - Dado que el usuario accede a la interfaz de login,
  - Cuando ingresa sus credenciales y son validadas por el backend,
  - Entonces recibe un token JWT y es redirigido a la vista correspondiente a su rol (admin, mesero, cocinero).
- **Escenario 2:** Acceso Restringido por Rol
  - Dado que un usuario autenticado intenta acceder a una funcionalidad restringida a otro rol,
  - Cuando el backend detecta que el rol no tiene permisos,
  - Entonces se deniega el acceso y se muestra un mensaje de error.
- **Escenario 3:** Credenciales Inválidas
  - Dado que el usuario ingresa credenciales incorrectas,
  - Cuando el backend rechaza la autenticación,
  - Entonces se muestra un mensaje de error y no se permite el acceso.

**Prioridad / Orden en el Backlog:** Alta
**Feature:** FT-001 - Seguridad y Autenticación
**Épica:** EP-002 - Seguridad y Control de Acceso
**Dependencias:** Ninguna
**Versión / Release:** 1.0

---

## US-013
**Identificador único (ID):** US-013

**Título:** Módulo de Gestión Administrativa Integral

**Descripción:** Como administrador, quiero un módulo de gestión donde pueda visualizar el dashboard con el resumen de la operación, gestionar productos, usuarios y configuraciones, para tener control centralizado y eficiente de la administración del restaurante.

**Criterios de Aceptación:**

- **Escenario 1:** Visualización de Dashboard
  - Dado que el administrador accede al módulo de gestión,
  - Cuando ingresa a la pestaña de dashboard,
  - Entonces visualiza métricas clave y el resumen de la operación.
- **Escenario 2:** Acceso a Gestión de Productos
  - Dado que el administrador está en el módulo de gestión,
  - Cuando selecciona la pestaña de productos,
  - Entonces puede crear, editar y listar productos (ver detalle en la HU correspondiente US-015).
- **Escenario 3:** Acceso a Gestión de Usuarios
  - Dado que el administrador está en el módulo de gestión,
  - Cuando selecciona la pestaña de usuarios,
  - Entonces puede crear, editar y listar usuarios administrativos (ver detalle en la HU correspondiente US-014).
- **Escenario 4:** Acceso a Configuración
  - Dado que el administrador está en el módulo de gestión,
  - Cuando selecciona la pestaña de configuración,
  - Entonces puede agregar, editar y listar categorías (ver detalle en la HU correspondiente US-013).

**Prioridad / Orden en el Backlog:** Alta
**Feature:** FT-009 - Módulo de Gestión Administrativa
**Épica:** EP-003 - Gestión Administrativa
**Dependencias:** Ninguna
**Versión / Release:** 1.0


## US-014
**Identificador único (ID):** US-014

**Título:** Gestión de Usuarios Administrativos

**Descripción:** Como administrador, quiero crear, editar y listar usuarios administrativos, para gestionar el acceso y los roles dentro del sistema.

**Criterios de Aceptación:**

- **Escenario 1:** Creación de Usuario
  - Dado que el administrador accede al módulo de usuarios,
  - Cuando ingresa los datos requeridos y guarda,
  - Entonces el usuario es creado y visible en la lista.
- **Escenario 2:** Edición de Usuario
  - Dado que el administrador selecciona un usuario existente,
  - Cuando modifica los datos y guarda,
  - Entonces los cambios se reflejan correctamente.

**Prioridad / Orden en el Backlog:** Alta
**Feature:** FT-010 - Administración de Usuarios
**Épica:** EP-003 - Gestión Administrativa
**Dependencias:** Ninguna
**Versión / Release:** 1.0

---


## US-015
**Identificador único (ID):** US-015

**Título:** Gestión de Productos

**Descripción:** Como administrador, quiero crear, editar y listar productos, para mantener actualizado el catálogo de productos del restaurante.

**Criterios de Aceptación:**

- **Escenario 1:** Creación de Producto
  - Dado que el administrador accede al módulo de productos,
  - Cuando ingresa los datos requeridos y guarda,
  - Entonces el producto es creado y visible en la lista.
- **Escenario 2:** Edición de Producto
  - Dado que el administrador selecciona un producto existente,
  - Cuando modifica los datos y guarda,
  - Entonces los cambios se reflejan correctamente.

**Prioridad / Orden en el Backlog:** Alta
**Feature:** FT-011 - Administración de Productos
**Épica:** EP-003 - Gestión Administrativa
**Dependencias:** Ninguna
**Versión / Release:** 1.0

---


## US-016
**Identificador único (ID):** US-016

**Título:** Gestión de Categorías desde Configuración

**Descripción:** Como administrador, quiero agregar, editar y listar categorías desde la pestaña de configuración, para organizar los productos de manera eficiente.

**Criterios de Aceptación:**

- **Escenario 1:** Creación de Categoría
  - Dado que el administrador accede a la pestaña de configuración,
  - Cuando ingresa el nombre de la categoría y guarda,
  - Entonces la categoría es creada y visible en la lista.
- **Escenario 2:** Edición de Categoría
  - Dado que el administrador selecciona una categoría existente,
  - Cuando modifica el nombre y guarda,
  - Entonces los cambios se reflejan correctamente.

**Prioridad / Orden en el Backlog:** Media
**Feature:** FT-012 - Administración de Categorías
**Épica:** EP-003 - Gestión Administrativa
**Dependencias:** Ninguna
**Versión / Release:** 1.0

---



## 2.3.18. Historia de Usuario 18
**Identificador único (ID):** US-018

**Título:** Restricción de Edición para Pedidos en Preparación o Listos

**Descripción:** Como mesero, quiero que el sistema impida la edición de un pedido si ya está en preparación o listo, para evitar inconsistencias y problemas en el flujo de trabajo de la cocina.

**Criterios de Aceptación:**

- **Escenario 1:** Intento de Edición de Pedido en Curso
  - Dado que un pedido tiene el estado "preparing" (En Preparación) o "ready" (Listo),
  - Cuando el mesero intenta editar el pedido a través de la interfaz,
  - Entonces el sistema muestra un mensaje de error ("No se puede editar un pedido en curso") y no permite la modificación.

**Prioridad / Orden en el Backlog:** Media
**Feature:** FT-005 - Edición de Pedidos
**Épica:** EP-001 - Automatización y Optimización de la Gestión de Pedidos
**Dependencias:** US-017
**Versión / Release:** 1.1

---


## 2.3.22. Historia de Usuario 22
**Identificador único (ID):** US-022

**Título:** Almacenar Estrategias de Cálculo de Tiempo en MongoDB

**Descripción:** Como microservicio de cocina, quiero almacenar y cargar dinámicamente las implementaciones de código de las estrategias de cálculo de tiempo de preparación desde MongoDB, para permitir la fácil configuración y extensión de las lógicas de negocio sin modificar el código principal.

**Criterios de Aceptación:**

- **Escenario 1:** Carga Dinámica de Estrategias al Iniciar
  - Dado que el microservicio Node.js inicia,
  - Cuando necesita calcular un tiempo de preparación usando el Strategy Pattern,
  - Entonces carga las implementaciones de código de las estrategias de cálculo desde MongoDB.

**Prioridad / Orden en el Backlog:** Media
**Feature:** FT-007 - Persistencia de Datos con MongoDB
**Épica:** EP-001 - Automatización y Optimización de la Gestión de Pedidos
**Dependencias:** US-021, US-030
**Versión / Release:** 1.0

---