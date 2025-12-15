# Casos de Prueba del Sistema

## HU-010: Cálculo del Tiempo Estimado de Preparación

### Caso de Prueba: CP-US010-001
**Descripción:** Cálculo Básico con un solo tipo de ítem simple (Partición Válida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Recibir evento de pedido "PEDIDO-001". 2. Microservicio procesa el evento. |
| **Datos de Entrada** | ID: "PEDIDO-001", items: [{nombre: "Refresco", cantidad: 2}] (Tiempo/unidad: 1 min) |
| **Resultado Esperado** | Tiempo estimado calculado como 4 minutos (2+2×1). Estado del pedido "PEDIDO-001" cambia a "preparing". |
---
### Caso de Prueba: CP-US010-002
**Descripción:** Cálculo Básico con un solo tipo de ítem medio (Partición Válida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Recibir evento de pedido "PEDIDO-002". 2. Microservicio procesa el evento. |
| **Datos de Entrada** | ID: "PEDIDO-002", items: [{nombre: "Hamburguesa Clásica", cantidad: 1}] (Tiempo/unidad: 3 min) |
| **Resultado Esperado** | Tiempo estimado calculado como 5 minutos (2+1×3). Estado del pedido "PEDIDO-002" cambia a "preparing". |
---
### Caso de Prueba: CP-US010-003
**Descripción:** Cálculo Básico con un solo tipo de ítem complejo (Partición Válida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Recibir evento de pedido "PEDIDO-003". 2. Microservicio procesa el evento. |
| **Datos de Entrada** | ID: "PEDIDO-003", items: [{nombre: "Plato Especial del Chef", cantidad: 1}] (Tiempo/unidad: 5 min) |
| **Resultado Esperado** | Tiempo estimado calculado como 7 minutos (2+1×5). Estado del pedido "PEDIDO-003" cambia a "preparing". |
---
### Caso de Prueba: CP-US010-004
**Descripción:** Cálculo con múltiples tipos de ítems (Combinación Válida DTT).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Recibir evento de pedido "PEDIDO-004". 2. Microservicio procesa el evento. |
| **Datos de Entrada** | ID: "PEDIDO-004", items: [{nombre: "Hamburguesa Clásica", cantidad: 1}, {nombre: "Refresco", cantidad: 2}, {nombre: "Plato Especial del Chef", cantidad: 1}] |
| **Resultado Esperado** | Tiempo estimado calculado como 12 minutos (2+1×3+2×1+1×5). Estado del pedido "PEDIDO-004" cambia a "preparing". |
---
### Caso de Prueba: CP-US010-005
**Descripción:** Pedido sin ítems (Partición Inválida / Límite Inferior BVA).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Recibir evento de pedido "PEDIDO-005". 2. Microservicio procesa el evento. |
| **Datos de Entrada** | ID: "PEDIDO-005", items: [] |
| **Resultado Esperado** | Tiempo estimado calculado como 2 minutos (solo tiempo base). Estado del pedido "PEDIDO-005" cambia a "preparing". |
---
### Caso de Prueba: CP-US010-006
**Descripción:** Pedido con cantidad cero de un ítem (Partición Inválida / BVA).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Recibir evento de pedido "PEDIDO-006". 2. Microservicio procesa el evento. |
| **Datos de Entrada** | ID: "PEDIDO-006", items: [{nombre: "Hamburguesa Clásica", cantidad: 1}, {nombre: "Refresco", cantidad: 0}] |
| **Resultado Esperado** | Tiempo estimado calculado como 5 minutos (2+1×3+0×1). Estado del pedido "PEDIDO-006" cambia a "preparing". |
---
### Caso de Prueba: CP-US010-007
**Descripción:** Pedido con un número muy grande de ítems (Límite Superior BVA).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Recibir evento de pedido "PEDIDO-007". 2. Microservicio procesa el evento. |
| **Datos de Entrada** | ID: "PEDIDO-007", items: [{nombre: "Refresco", cantidad: 100}] |
| **Resultado Esperado** | Tiempo estimado calculado como 102 minutos (2+100×1). Estado del pedido "PEDIDO-007" cambia a "preparing". |
---
### Caso de Prueba: CP-US010-008
**Descripción:** Pedido con un ítem no reconocido en el catálogo (Adivinación de Errores).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Recibir evento de pedido "PEDIDO-008". 2. Microservicio procesa el evento. |
| **Datos de Entrada** | ID: "PEDIDO-008", items: [{nombre: "Ítem Desconocido", cantidad: 1}] |
| **Resultado Esperado** | El sistema maneja el ítem desconocido (ej. tiempo por defecto 0). Tiempo de preparación estimado calculado sin fallar. Estado del pedido "PEDIDO-008" cambia a "preparing". Se registra una alerta/error sobre el ítem no reconocido en logs. |
---
### Caso de Prueba: CP-US010-009
**Descripción:** Pedido con estructura de datos inválida (JSON mal formado) (Adivinación de Errores).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Recibir evento de pedido "PEDIDO-009". 2. Microservicio intenta procesar el evento. |
| **Datos de Entrada** | ID: "PEDIDO-009", Evento JSON mal formado o faltan campos ("items" o "quantity"). |
| **Resultado Esperado** | El microservicio registra un error de procesamiento de evento. El estado del pedido "PEDIDO-009" no cambia (permanece original o no se crea). Se notifica al sistema de monitoreo. |
---
### Caso de Prueba: CP-US010-010
**Descripción:** Pedido con ID de pedido ya existente en estado "pending" (Adivinación de Errores / Regla Implícita).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Precondición: Pedido "PEDIDO-010" en estado "pending". 2. Recibir evento duplicado "PEDIDO-010". 3. Microservicio procesa el evento. |
| **Datos de Entrada** | ID: "PEDIDO-010", items: [...] (ej. 1 Hamburguesa). |
| **Resultado Esperado** | El microservicio actualiza el pedido (si aplica) o ignora el duplicado. Estado del pedido "PEDIDO-010... |
---

## HU-011: Actualización de Pedidos Pendientes

### Caso de Prueba: CP-US011-001
**Descripción:** Actualización exitosa - Añadir ítems a pedido pendiente (EP - Partición Válida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. El microservicio Node.js recibe un mensaje de actualización para el ID "PEDIDO-001" con el nuevo ítem. |
| **Datos de Entrada** | ID del pedido: "PEDIDO-001", Estado inicial: "pending", Ítems iniciales: [ { "nombre": "Refresco", "cantidad": 1 } ], Ítems a añadir: [ { "nombre": "Hamburguesa Clásica", "cantidad": 1 } ] |
| **Resultado Esperado** | El pedido "PEDIDO-001" en MongoDB se actualiza con los ítems: [ { "nombre": "Refresco", "cantidad": 1 }, { "nombre": "Hamburguesa Clásica", "cantidad": 1 } ].Se emite un evento ORDER_UPDATED vía WebSocket con el ID "PEDIDO-001" y los ítems actualizados. |
---
### Caso de Prueba: CP-US011-002
**Descripción:** Actualización exitosa - Modificar cantidad de ítem en pedido pendiente (EP - Partición Válida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. El microservicio Node.js recibe un mensaje de actualización para el ID "PEDIDO-002" cambiando la cantidad de "Refresco". |
| **Datos de Entrada** | ID del pedido: "PEDIDO-002", Estado inicial: "pending", Ítems iniciales: [ { "nombre": "Refresco", "cantidad": 1 }, { "nombre": "Hamburguesa Clásica", "cantidad": 1 } ], Modificación: Cambiar cantidad de "Refresco" a 2 |
| **Resultado Esperado** | El pedido "PEDIDO-002" en MongoDB se actualiza con los ítems: [ { "nombre": "Refresco", "cantidad": 2 }, { "nombre": "Hamburguesa Clásica", "cantidad": 1 } ]$.<br>Se emite un evento ORDER_UPDATED`vía WebSocket con el ID "PEDIDO-002" y los ítems actualizados. |
---
### Caso de Prueba: CP-US011-004
**Descripción:** Actualización exitosa - Cambiar nombre de cliente y mesa en pedido pendiente (EP - Partición Válida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. El microservicio Node.js recibe un mensaje de actualización para el ID "PEDIDO-004" con el nuevo cliente y mesa. |
| **Datos de Entrada** | ID del pedido: "PEDIDO-004", Estado inicial: "pending", Cliente inicial: "Juan Pérez", Mesa inicial: "5", Nuevo cliente: "María García", Nueva mesa: "7" |
| **Resultado Esperado** | El pedido "PEDIDO-004" en MongoDB se actualiza con cliente "María García" y mesa "7".Se emite un evento ORDER_UPDATED vía WebSocket con el ID "PEDIDO-004" y los datos actualizados. |
---
### Caso de Prueba: CP-US011-005
**Descripción:** Actualización exitosa - Pedido queda sin ítems en estado pendiente (BVA - Límite Inferior).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. El microservicio Node.js recibe un mensaje de actualización para el ID "PEDIDO-005" eliminando todos los ítems. |
| **Datos de Entrada** | ID del pedido: "PEDIDO-005", Estado inicial: "pending", Ítems iniciales: [ { "nombre": "Refresco", "cantidad": 1 } ], Ítems a eliminar: todos |
| **Resultado Esperado** | El pedido "PEDIDO-005" en MongoDB se actualiza con una lista de ítems vacía.Se emite un evento ORDER_UPDATED vía WebSocket con el ID "PEDIDO-005" y la lista de ítems vacía. |
---
### Caso de Prueba: CP-US011-006
**Descripción:** Intento de actualización de pedido en estado "preparing" (STT - Transición Inválida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. El microservicio Node.js recibe un mensaje de actualización para el ID "PEDIDO-006". |
| **Datos de Entrada** | ID del pedido: "PEDIDO-006", Estado inicial: "preparing", Operación: Añadir un ítem |
| **Resultado Esperado** | El estado del pedido "PEDIDO-006" permanece en "preparing".El pedido "PEDIDO-006" en MongoDB no se modifica.No se emite ningún evento ORDER_UPDATED vía WebSocket para "PEDIDO-006".Se registra una advertencia o error indicando que el pedido no puede ser modificado en su estado actual. |
---
### Caso de Prueba: CP-US011-007
**Descripción:** Intento de actualización de pedido en estado "ready" (STT - Transición Inválida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. El microservicio Node.js recibe un mensaje de actualización para el ID "PEDIDO-007". |
| **Datos de Entrada** | ID del pedido: "PEDIDO-007", Estado inicial: "ready", Operación: (cualquier modificación) |
| **Resultado Esperado** | El estado del pedido "PEDIDO-007" permanece en "ready".El pedido "PEDIDO-007" en MongoDB no se modifica.No se emite ningún evento ORDER_UPDATED vía WebSocket para "PEDIDO-007".Se registra una advertencia o error. |
---
### Caso de Prueba: CP-US011-008
**Descripción:** Intento de actualización de pedido en estado "completed" (STT - Transición Inválida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. El microservicio Node.js recibe un mensaje de actualización para el ID "PEDIDO-008". |
| **Datos de Entrada** | ID del pedido: "PEDIDO-008", Estado inicial: "completed", Operación: (... |
| **Resultado Esperado** | El estado del pedido "PEDIDO-008" permanece en "completed".El pedido "PEDIDO-008" en MongoDB no se modifica.No se emite ningún evento ORDER_UPDATED vía WebSocket para "PEDIDO-008".Se registra una advertencia o error. |
---

## HU-018: Restricción de Edición de Pedidos en Curso

### Caso de Prueba: CP-US018-001
**Descripción:** Intento de edición de pedido en estado "preparing" (STT - Transición Inválida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Visualizar el pedido "PEDIDO-001" en la interfaz. 2. Intentar acceder a la opción/botón de edición del pedido. |
| **Datos de Entrada** | ID de Pedido: PEDIDO-001. Estado Inicial: preparing. |
| **Resultado Esperado** | La interfaz muestra el mensaje de error: "No se puede editar un pedido en curso". La edición no es permitida. El estado y detalles del pedido en DB (MongoDB) no cambian. |
---
### Caso de Prueba: CP-US018-002
**Descripción:** Intento de edición de pedido en estado "ready" (STT - Transición Inválida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Visualizar el pedido "PEDIDO-002" en la interfaz. 2. Intentar acceder a la opción/botón de edición del pedido. |
| **Datos de Entrada** | ID de Pedido: PEDIDO-002. Estado Inicial: ready. |
| **Resultado Esperado** | La interfaz muestra el mensaje de error: "No se puede editar un pedido en curso". La edición no es permitida. El estado y detalles del pedido en DB (MongoDB) no cambian. |
---
### Caso de Prueba: CP-US018-003
**Descripción:** Intento de edición de pedido en estado "completed" (STT - Transición Inválida / EG - Extensión de Regla).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Visualizar el pedido "PEDIDO-003" en la interfaz. 2. Intentar acceder a la opción/botón de edición del pedido. |
| **Datos de Entrada** | ID de Pedido: PEDIDO-003. Estado Inicial: completed. |
| **Resultado Esperado** | La interfaz muestra un mensaje de error: "No se puede editar un pedido en curso" (o similar para "completado"). La edición no es permitida. El estado y detalles del pedido en DB (MongoDB) no cambian. |
---
### Caso de Prueba: CP-US018-004
**Descripción:** Verificación de mensaje de error correcto para estado "preparing" (EG - Mensaje Específico).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Intentar editar el pedido "PEDIDO-004" a través de la interfaz. |
| **Datos de Entrada** | ID de Pedido: PEDIDO-004. Estado: preparing. |
| **Resultado Esperado** | El mensaje de error mostrado es exactamente "No se puede editar un pedido en curso". Ninguna interacción de edición es permitida. |
---
### Caso de Prueba: CP-US018-005
**Descripción:** Verificación de mensaje de error correcto para estado "ready" (EG - Mensaje Específico).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Intentar editar el pedido "PEDIDO-005" a través de la interfaz. |
| **Datos de Entrada** | ID de Pedido: PEDIDO-005. Estado: ready. |
| **Resultado Esperado** | El mensaje de error mostrado es exactamente "No se puede editar un pedido en curso". Ninguna interacción de edición es permitida. |
---
### Caso de Prueba: CP-US018-006
**Descripción:** Intento de edición de campos específicos en estado "preparing" (EG - Campos Individuales).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Visualizar el pedido "PEDIDO-006" en la interfaz. 2. Intentar modificar el nombre del cliente, el número de mesa o la cantidad de un ítem. 3. Intentar guardar la modificación. |
| **Datos de Entrada** | ID de Pedido: PEDIDO-006. Estado: preparing.... |
| **Resultado Esperado** | El sistema no permite la modificación de ningún campo individual del pedido. El mensaje de error es mostrado. |
---

## HU-022: Carga Dinámica de Estrategias de Cálculo

### Caso de Prueba: CP-US022-001
**Descripción:** Carga exitosa de una estrategia válida al iniciar (EP - Partición Válida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Iniciar el microservicio Node.js. 2. El microservicio intenta cargar la estrategia desde MongoDB. |
| **Datos de Entrada** | MongoDB: Estrategia de cálculo de tiempo válida con ID "ESTRATEGIA-SIMPLE" y código ejecutable. |
| **Resultado Esperado** | La estrategia "ESTRATEGIA-SIMPLE" se carga correctamente desde MongoDB. El microservicio puede utilizar la lógica de "ESTRATEGIA-SIMPLE" para calcular tiempos de preparación. |
---
### Caso de Prueba: CP-US022-002
**Descripción:** Carga exitosa de múltiples estrategias válidas al iniciar (EP - Partición Válida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Iniciar el microservicio Node.js. 2. El microservicio intenta cargar todas las estrategias desde MongoDB. |
| **Datos de Entrada** | MongoDB: Múltiples estrategias de cálculo de tiempo válidas (ej. "ESTRATEGIA-SIMPLE", "ESTRATEGIA-COMPLEJA") con código ejecutable. |
| **Resultado Esperado** | Todas las estrategias válidas se cargan correctamente desde MongoDB. El microservicio puede seleccionar y utilizar cualquiera de las lógicas cargadas para calcular tiempos de preparación. |
---
### Caso de Prueba: CP-US022-003
**Descripción:** Carga cuando no hay estrategias en MongoDB (EG - Ausencia de Datos).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Iniciar el microservicio Node.js. 2. El microservicio intenta cargar estrategias de MongoDB. |
| **Datos de Entrada** | MongoDB: Colección de estrategias vacía. |
| **Resultado Esperado** | El microservicio no carga ninguna estrategia dinámica. El microservicio utiliza una estrategia de cálculo de tiempo por defecto o de fallback. Se registra una advertencia en los logs indicando la ausencia de estrategias dinámicas. |
---
### Caso de Prueba: CP-US022-004
**Descripción:** Carga con una estrategia con código sintácticamente inválido (EG - Datos Inválidos).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Iniciar el microservicio Node.js. 2. El microservicio intenta cargar la estrategia desde MongoDB. |
| **Datos de Entrada** | MongoDB: Estrategia con ID "ESTRATEGIA-INVALIDA" cuyo campo code contiene un string con sintaxis JavaScript inválida. |
| **Resultado Esperado** | La estrategia "ESTRATEGIA-INVALIDA" no se carga correctamente. El microservicio registra un error de sintaxis al intentar procesar el código. El microservicio utiliza una estrategia de cálculo de tiempo por defecto o de fallback. Se registra un error detallado en los logs. |
---
### Caso de Prueba: CP-US022-005
**Descripción:** Carga con una estrategia con código semánticamente inválido (EG - Datos Inválidos).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Iniciar el microservicio Node.js. 2. El microservicio intenta cargar la estrategia desde MongoDB. |
| **Datos de Entrada** | MongoDB: Estrategia con ID "ESTRATEGIA-SEMANTICA-INVALIDA" cuyo campo code es sintácticamente válido pero no cumple con la interfaz esperada. |
| **Resultado Esperado** | La estrategia "ESTRATEGIA-SEMANTICA-INVALIDA" no se carga correctamente o no es utilizable. El microservicio registra un error de validación de la interfaz de la estrategia. El microservicio utiliza una estrategia de cálculo de tiempo por defecto o... |
---

## HU-023: Gestión de Roles y Permisos

### Caso de Prueba: CP-US023-001
**Descripción:** Creación exitosa de un nuevo rol con permisos (EP - Partición Válida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Acceder a la sección de "Gestión de Roles".2. Crear un nuevo rol.3. Ingresar el nombre del rol: "Jefe de Cocina".4. Asignar los permisos "ver historial de pedidos" y "editar menú". |
| **Datos de Entrada** | Nombre del rol: "Jefe de Cocina", Permisos: ["ver historial de pedidos", "editar menú"] |
| **Resultado Esperado** | El rol "Jefe de Cocina" se guarda correctamente en el sistema.El rol "Jefe de Cocina" está disponible en la lista de roles para asignación.Los permisos asignados se asocian correctamente al rol. |
---
### Caso de Prueba: CP-US023-002
**Descripción:** Creación exitosa de un nuevo rol sin permisos iniciales (EP - Partición Válida).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Acceder a la sección de "Gestión de Roles".2. Crear un nuevo rol.3. Ingresar el nombre del rol: "Personal de Limpieza".4. No asignar ningún permiso. |
| **Datos de Entrada** | Nombre del rol: "Personal de Limpieza", Permisos: Ninguno |
| **Resultado Esperado** | El rol "Personal de Limpieza" se guarda correctamente en el sistema.El rol "Personal de Limpieza" está disponible en la lista de roles para asignación.El rol no tiene permisos asociados. |
---
### Caso de Prueba: CP-US023-003
**Descripción:** Intento de crear un rol con nombre duplicado (Adivinación de Errores).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Intentar crear un nuevo rol.2. Ingresar el nombre del rol: "Mesero" (ya existente).3. Asignar algunos permisos. |
| **Datos de Entrada** | Nombre del rol a crear: "Mesero", Rol existente: "Mesero", Permisos a asignar: (algunos) |
| **Resultado Esperado** | El sistema muestra un mensaje de error: "Ya existe un rol con este nombre".El nuevo rol no se crea.El rol "Mesero" existente permanece inalterado. |
---
### Caso de Prueba: CP-US023-004
**Descripción:** Intento de crear un rol con nombre vacío (BVA - Límite Inferior / Adivinación de Errores).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Acceder a la sección de "Gestión de Roles".2. Intentar crear un nuevo rol.3. Ingresar el nombre del rol: vacío o solo espacios en blanco.4. Asignar algunos permisos. |
| **Datos de Entrada** | Nombre del rol: vacío o " " (solo espacios), Permisos a asignar: (algunos) |
| **Resultado Esperado** | El sistema muestra un mensaje de error: "El nombre del rol no puede estar vacío".El nuevo rol no se crea. |
---
### Caso de Prueba: CP-US023-005
**Descripción:** Intento de crear un rol con nombre que excede la longitud máxima (BVA - Límite Superior / Adivinación de Errores).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Intentar crear un nuevo rol.2. Ingresar el nombre del rol: "EsteEsUnNombreDeRolExtremadamenteLargoParaProbarElLimite". |
| **Datos de Entrada** | Longitud máxima permitida: 50 caracteres, Nombre del rol: "EsteEsUnNombreDeRolExtremadamenteLargoParaProbarElLimite" (51 caracteres) |
| **Resultado Esperado** | El sistema muestra un mensaje de error: "El nombre del rol excede la longitud máxima permitida".El nuevo rol no se crea. |
---
### Caso de Prueba: CP-US023-006
**Descripción:** Asignación de todos los permisos disponibles a un nuevo rol (BVA - Límite Superior).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Acceder a la sección de "Gestión de Roles".2. Crear un nuevo rol.3. Ingresar el nombre del rol: "Super Usuario".4. Asignar los 10 permisos disponibles en el sistema. |
| **Datos de Entrada** | Nombre del rol: "Super Usuario", Cantidad de permisos disponibles: 10, Permisos asignados: (los 10 disponibles) |
| **Resultado Esperado** | El rol "Super Usuario" se guarda correctamente en el sistema.Todos los permisos se asocian correctamente al rol. |
---
### Caso de Prueba: CP-US023-007
**Descripción:** Creación de rol con caracteres especiales en el nombre (Adivinación de Errores).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Acceder a la sección de "Gestión de Roles".2. Crear un nuevo rol.3. Ingresar el nombre del rol: "Cocinero-Auxiliar!".4. Asignar algunos permisos. |
| **Datos de Entrada** | Nombre del rol: "Cocinero-Auxiliar!", Caracteres especiales: ["-", "!"] |
| **Resultado Esperado** | El rol "Cocinero-Auxiliar!" se guarda correctamente en el sistema (asumiendo que los caracteres especiales son permitidos según la especificación).El rol está disponible para asignación. |
---
### Caso de Prueba: CP-US023-008
**Descripción:** Falla en la persistencia del rol en la base de datos (Adivinación de Errores - Resiliencia).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Intentar crear un nuevo rol.2. Confirmar la creación del rol (simulando una falla de conexión DB). |
| **Datos de Entrada** | Falla simulada: Conexión a la base de datos de roles |
| **Resultado Esperado** | El sistema muestra un mensaje de error: "Error al guardar el rol. Intente de nuevo más tarde."El rol no se crea en la base de datos.Se registra un error en los logs del sistema. |
---
### Caso de Prueba: CP-US023-009
**Descripción:** Edición de permisos de un rol existente (Adivinación de Errores - Modificación).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Acceder a la edición del rol "Mesero".2. Añadir el permiso "ver estado de pedidos".3. Eliminar el permiso "gestionar mesas". |
| **Datos de Entrada** | Rol existente: "Mesero", Permisos iniciales: ["tomar pedidos", "gestionar mesas"], Permiso añadido: "ver estado de pedidos", Permiso eliminado: "gestionar mesas" |
| **Resultado Esperado** | El rol "Mesero" se actualiza correctamente en el sistema.Sus permisos son ahora "tomar pedidos" y "ver estado de pedidos". |
---
### Caso de Prueba: CP-US023-010
**Descripción:** Eliminación de un rol existente que no está asignado a ningún usuario (Adivinación de Errores - Eliminación).

| Campo | Detalle |
| :--- | :--- |
| **Pasos** | 1. Acceder a la sección de "Gestión de Roles".2. Seleccionar el rol "Personal... |
| **Datos de Entrada** | Rol a eliminar: "Personal de Limpieza" (sin asignaciones activas). |
| **Resultado Esperado** | El rol "Personal de Limpieza" se elimina correctamente del sistema.Ya no aparece en la lista de roles. |
---