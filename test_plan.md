# Test Plan - Sistema de Pedidos de Restaurante

## 1. Información del Documento

| Campo | Valor |
|-------|-------|
| **Proyecto** | Sistema Distribuido de Gestión de Pedidos para Restaurantes |
| **Versión del Plan** | 1.0 |
| **Fecha de Creación** | Diciembre 17, 2025 |
| **Última Actualización** | Diciembre 17, 2025 |
| **Responsable QA** | Test & Quality Assurance Team |
| **Estado** | Aprobado |
| **Versión del Sistema** | 1.1 |

---

## 2. Resumen Ejecutivo

### 2.1 Propósito del Documento
Este documento define la estrategia, alcance, recursos, cronograma y enfoque de pruebas para el Sistema de Pedidos de Restaurante. El objetivo es garantizar que el sistema cumpla con todos los requerimientos funcionales y no funcionales antes de su despliegue en producción.

### 2.2 Alcance del Sistema
Sistema distribuido de microservicios que permite:
- Toma de pedidos desde tablets (meseros)
- Procesamiento en tiempo real con arquitectura de microservicios
- Visualización de pedidos en cocina con actualización en vivo
- Gestión administrativa completa (productos, usuarios, categorías)
- Autenticación y control de acceso por roles (RBAC)
- Comunicación asíncrona mediante RabbitMQ
- Persistencia de datos en MongoDB
- Notificaciones en tiempo real vía WebSocket

### 2.3 Objetivos de las Pruebas
- Verificar que todos los requerimientos funcionales estén implementados correctamente
- Validar la integración entre microservicios
- Garantizar la seguridad del sistema (autenticación, autorización, validación de entrada)
- Asegurar el rendimiento y escalabilidad del sistema
- Confirmar la resiliencia ante fallos
- Validar la experiencia de usuario en diferentes roles

---

## 3. Alcance de las Pruebas

### 3.1 Componentes en Alcance

#### 3.1.1 Frontend
- **Frontend de Mesero** (React + TypeScript + Vite) - Puerto 5173
  - Toma de pedidos
  - Carrito de compras
  - Especificaciones de productos
  
- **Frontend de Cocina** (React + TypeScript)
  - Visualización de pedidos en tiempo real
  - Gestión de estados de pedidos
  - Conexión WebSocket

- **Frontend Administrativo** (React + TypeScript)
  - Dashboard operacional
  - Gestión de productos
  - Gestión de usuarios
  - Gestión de categorías

#### 3.1.2 Backend
- **API Gateway** (Node.js + Express) - Puerto 3000
  - Enrutamiento centralizado
  - Patrón Proxy
  - Manejo de errores
  - Retry logic

- **Backend Python** (FastAPI) - Puerto 8000
  - Validación de pedidos
  - Publicación en RabbitMQ
  - API REST

- **Backend Node.js Cocina** (Express + TypeScript) - Puerto 3002
  - Consumo de mensajes RabbitMQ
  - Cálculo de tiempos de preparación
  - API de consulta de pedidos
  - Persistencia en MongoDB

- **Admin Service** (Node.js + Express) - Puerto 4001
  - Gestión de usuarios
  - Gestión de productos
  - Gestión de categorías
  - Autenticación JWT

#### 3.1.3 Infraestructura
- **RabbitMQ** - Puertos 5672, 15672
  - Cola orders.new
  - Dead Letter Queue (DLQ)
  
- **MongoDB** - Puerto 27017
  - Persistencia de pedidos
  - Persistencia de usuarios
  - Persistencia de productos y categorías

- **WebSocket Server** - Puerto 4000
  - Notificaciones en tiempo real
  - Eventos: ORDER_NEW, ORDER_READY, ORDER_UPDATED, QUEUE_EMPTY

### 3.2 Funcionalidades en Alcance

#### Módulo de Pedidos
- ✅ Creación de pedidos
- ✅ Edición de pedidos (solo estado "Pendiente")
- ✅ Visualización de pedidos
- ✅ Cálculo de tiempos de preparación
- ✅ Cambio de estados (Pendiente → En Preparación → Listo)
- ✅ Notificaciones en tiempo real

#### Módulo de Autenticación y Autorización
- ✅ Login con JWT
- ✅ Control de acceso por roles (RBAC)
- ✅ Roles: Administrador, Mesero, Cocinero
- ✅ Validación de tokens
- ✅ Manejo de sesiones

#### Módulo Administrativo
- ✅ Dashboard con métricas
- ✅ CRUD de productos
- ✅ CRUD de usuarios
- ✅ CRUD de categorías

#### Integración y Comunicación
- ✅ Comunicación asíncrona (RabbitMQ)
- ✅ Comunicación en tiempo real (WebSocket)
- ✅ Orquestación de microservicios (API Gateway)
- ✅ Persistencia de datos (MongoDB)

### 3.3 Fuera de Alcance
- ❌ Pruebas de carga extrema (>1000 pedidos simultáneos)
- ❌ Pruebas de penetración avanzadas
- ❌ Pruebas de compatibilidad con navegadores legacy (IE11)
- ❌ Pruebas de accesibilidad WCAG 2.1 AAA (solo AA)
- ❌ Pruebas de localización (i18n)

---

## 4. Estrategia de Pruebas

### 4.1 Niveles de Pruebas

#### 4.1.1 Pruebas Unitarias
**Objetivo:** Verificar el correcto funcionamiento de componentes individuales

**Alcance:**
- Funciones de utilidad (formateo de moneda, validaciones)
- Servicios de negocio (cálculo de tiempos, validaciones)
- Repositorios (MongoDB)
- Controladores (API endpoints)

**Herramientas:**
- Jest (JavaScript/TypeScript)
- Pytest (Python)
- mongodb-memory-server (tests con BD)

**Cobertura Objetivo:** >70%

**Responsable:** Desarrolladores

#### 4.1.2 Pruebas de Integración
**Objetivo:** Verificar la correcta interacción entre componentes

**Alcance:**
- Frontend → API Gateway → Microservicios
- Microservicios → RabbitMQ
- Microservicios → MongoDB
- WebSocket → Frontend

**Herramientas:**
- Supertest (Node.js)
- Postman/Newman
- Docker Compose (entorno de integración)

**Responsable:** QA Team + Desarrolladores

#### 4.1.3 Pruebas End-to-End (E2E)
**Objetivo:** Validar flujos completos de usuario

**Alcance:**
- Flujo completo de pedido (mesero → cocina)
- Flujo de autenticación y autorización
- Flujo administrativo completo
- Múltiples pedidos simultáneos

**Herramientas:**
- Cypress / Playwright
- Docker Compose (entorno completo)

**Responsable:** QA Team

#### 4.1.4 Pruebas de Sistema
**Objetivo:** Verificar el sistema completo en un entorno similar a producción

**Alcance:**
- Todos los componentes integrados
- Configuración de producción
- Datos realistas

**Herramientas:**
- Docker Compose
- Postman Collections
- Scripts de automatización

**Responsable:** QA Team

### 4.2 Tipos de Pruebas

#### 4.2.1 Pruebas Funcionales
- Validación de requerimientos funcionales
- Casos de uso principales
- Casos de borde
- Manejo de errores

#### 4.2.2 Pruebas de Seguridad
- Autenticación y autorización
- Validación de entrada (SQL injection, XSS)
- CORS
- Tokens JWT
- Manejo de sesiones

#### 4.2.3 Pruebas de Rendimiento
- Tiempo de respuesta de APIs (<500ms)
- Carga de frontend (<2s)
- Procesamiento de pedidos (>100/hora)
- Uso de memoria y CPU

#### 4.2.4 Pruebas de Usabilidad
- Experiencia de usuario por rol
- Navegación intuitiva
- Mensajes de error claros
- Responsive design (tablets)

#### 4.2.5 Pruebas de Resiliencia
- Reconexión automática (WebSocket, RabbitMQ)
- Manejo de fallos de BD
- Retry logic
- Dead Letter Queue

---

## 5. Casos de Prueba

### 5.1 Organización de Casos de Prueba

Los casos de prueba están organizados por Historia de Usuario (US) y documentados en `TEST_CASES.md`:

| Historia de Usuario | Casos de Prueba | Prioridad |
|---------------------|-----------------|-----------|
| US-010: Cálculo de Tiempo de Preparación | CP-US010-001 a CP-US010-022 | Crítica |
| US-011: Actualizar Pedido y Notificar | CP-US011-001 a CP-US011-017 | Alta |
| US-012: Autenticación y Control de Acceso | US-012-TC-001 a US-012-TC-031 | Crítica |
| US-013: Módulo de Gestión Administrativa | US-013-TC-001 a US-013-TC-018 | Alta |
| US-014: Gestión de Usuarios | US-014-TC-001 a US-014-TC-032 | Alta |
| US-015: Gestión de Productos | US-015-TC-001 a US-015-TC-031 | Alta |
| US-016: Gestión de Categorías | US-016-TC-001 a US-016-TC-016+ | Media |

**Total de Casos de Prueba Documentados:** 147+

### 5.2 Priorización de Casos de Prueba

#### Prioridad Crítica (P0)
- Autenticación y autorización
- Creación y procesamiento de pedidos
- Comunicación WebSocket
- Integración RabbitMQ
- Persistencia en MongoDB

#### Prioridad Alta (P1)
- Gestión administrativa (productos, usuarios, categorías)
- Edición de pedidos
- Cambio de estados
- Validaciones de entrada

#### Prioridad Media (P2)
- Dashboard y métricas
- Paginación
- Filtros y búsquedas
- Mensajes de error específicos

#### Prioridad Baja (P3)
- Optimizaciones de UI
- Animaciones
- Tooltips y ayudas

---

## 6. Criterios de Entrada y Salida

### 6.1 Criterios de Entrada (Entry Criteria)

Para iniciar las pruebas, se deben cumplir:

- ✅ Código fuente completo y versionado en repositorio
- ✅ Documentación técnica actualizada (README, BUSINESS_CONTEXT, etc.)
- ✅ Entorno de pruebas configurado y funcional
- ✅ Todos los servicios levantados con Docker Compose
- ✅ Base de datos con datos de prueba
- ✅ Casos de prueba documentados y revisados
- ✅ Herramientas de testing instaladas y configuradas

### 6.2 Criterios de Salida (Exit Criteria)

Para considerar las pruebas completas:

- ✅ 100% de casos de prueba P0 ejecutados y aprobados
- ✅ 95% de casos de prueba P1 ejecutados y aprobados
- ✅ 80% de casos de prueba P2 ejecutados
- ✅ Cobertura de código >70%
- ✅ 0 defectos críticos abiertos
- ✅ <3 defectos altos abiertos
- ✅ Todos los requerimientos funcionales validados
- ✅ Pruebas de seguridad aprobadas
- ✅ Pruebas de rendimiento dentro de umbrales
- ✅ Documentación de defectos completa
- ✅ Reporte de pruebas generado y aprobado

---

## 7. Entorno de Pruebas

### 7.1 Configuración de Entorno

#### 7.1.1 Entorno Local (Desarrollo)
```yaml
Servicios:
  - Frontend Mesero: http://localhost:5173
  - API Gateway: http://localhost:3000
  - Python MS: http://localhost:8000
  - Node MS: http://localhost:3002
  - Admin Service: http://localhost:4001
  - WebSocket: ws://localhost:4000
  - RabbitMQ: localhost:5672 (Management: 15672)
  - MongoDB: localhost:27017

Tecnologías:
  - Docker 20.10+
  - Docker Compose 2.0+
  - Node.js 18+
  - Python 3.9+
  - MongoDB 6+
  - RabbitMQ 3.12+
```

#### 7.1.2 Entorno de QA (Testing)
- Configuración idéntica a producción
- Datos de prueba realistas
- Logs habilitados
- Monitoreo activo

#### 7.1.3 Entorno de Staging (Pre-producción)
- Réplica exacta de producción
- Datos anonimizados
- Pruebas de aceptación de usuario (UAT)

### 7.2 Datos de Prueba

#### 7.2.1 Usuarios de Prueba
```javascript
Administrador:
  - Usuario: admin@sofka.com.co
  - Contraseña: admin123
  - Rol: Administrador

Mesero:
  - Usuario: mesero1
  - Contraseña: Pass1234!
  - Rol: Mesero

Cocinero:
  - Usuario: cocinero1
  - Contraseña: Pass1234!
  - Rol: Cocinero
```

#### 7.2.2 Productos de Prueba
```javascript
[
  { nombre: "Hamburguesa", precio: 10500, categoria: "Platos Fuertes" },
  { nombre: "Papas fritas", precio: 12000, categoria: "Acompañamientos" },
  { nombre: "Perro caliente", precio: 8000, categoria: "Platos Fuertes" },
  { nombre: "Refresco", precio: 7000, categoria: "Bebidas" }
]
```

#### 7.2.3 Pedidos de Prueba
```javascript
Pedido Simple:
  - Cliente: "Juan Pérez"
  - Mesa: "Mesa 7"
  - Items: 1x Hamburguesa

Pedido Complejo:
  - Cliente: "María García"
  - Mesa: "Mesa 3"
  - Items: 2x Hamburguesa (sin cebolla), 1x Papas, 2x Refresco
```

---

## 8. Recursos

### 8.1 Equipo de Pruebas

| Rol | Nombre | Responsabilidades |
|-----|--------|-------------------|
| QA Lead | [Nombre] | Planificación, coordinación, reportes |
| QA Engineer 1 | [Nombre] | Pruebas funcionales, E2E |
| QA Engineer 2 | [Nombre] | Pruebas de integración, seguridad |
| QA Automation | [Nombre] | Automatización de pruebas |
| Desarrollador 1 | Leonardo Pérez | Pruebas unitarias, soporte |
| Desarrollador 2 | Dayhana Acevedo | Pruebas unitarias, soporte |
| Desarrollador 3 | Jessica Salgado | Pruebas unitarias, soporte |
| Desarrollador 4 | Robinson Muñetón | Pruebas unitarias, soporte |

### 8.2 Herramientas

#### 8.2.1 Gestión de Pruebas
- **Jira / Azure DevOps:** Gestión de casos de prueba y defectos
- **TestRail:** Gestión de casos de prueba (opcional)
- **Confluence:** Documentación

#### 8.2.2 Automatización
- **Jest:** Pruebas unitarias (JavaScript/TypeScript)
- **Pytest:** Pruebas unitarias (Python)
- **Cypress / Playwright:** Pruebas E2E
- **Supertest:** Pruebas de API
- **Postman / Newman:** Pruebas de API

#### 8.2.3 Monitoreo y Logs
- **Docker Logs:** Logs de contenedores
- **MongoDB Compass:** Inspección de BD
- **RabbitMQ Management:** Monitoreo de colas

#### 8.2.4 Reportes
- **Jest Coverage:** Cobertura de código
- **Allure:** Reportes de pruebas
- **Custom Scripts:** Reportes personalizados

---

## 9. Cronograma

### 9.1 Fases de Pruebas

| Fase | Duración | Actividades | Responsable |
|------|----------|-------------|-------------|
| **Fase 1: Preparación** | 3 días | - Configuración de entornos<br>- Preparación de datos<br>- Revisión de casos de prueba | QA Team |
| **Fase 2: Pruebas Unitarias** | 5 días | - Ejecución de pruebas unitarias<br>- Corrección de defectos<br>- Cobertura de código | Desarrolladores |
| **Fase 3: Pruebas de Integración** | 5 días | - Pruebas de APIs<br>- Pruebas de integración<br>- Validación de comunicación | QA + Dev |
| **Fase 4: Pruebas E2E** | 7 días | - Flujos completos<br>- Casos de uso principales<br>- Casos de borde | QA Team |
| **Fase 5: Pruebas de Sistema** | 5 días | - Pruebas de seguridad<br>- Pruebas de rendimiento<br>- Pruebas de resiliencia | QA Team |
| **Fase 6: Regresión** | 3 días | - Re-ejecución de casos críticos<br>- Validación de correcciones | QA Team |
| **Fase 7: UAT** | 5 días | - Pruebas de aceptación<br>- Validación con usuarios finales | Stakeholders |
| **Fase 8: Cierre** | 2 días | - Reporte final<br>- Documentación<br>- Lecciones aprendidas | QA Lead |

**Duración Total:** 35 días (7 semanas)

### 9.2 Hitos Clave

| Hito | Fecha Objetivo | Entregable |
|------|----------------|------------|
| Inicio de Pruebas | Día 1 | Entorno configurado |
| Pruebas Unitarias Completas | Día 8 | Cobertura >70% |
| Pruebas de Integración Completas | Día 13 | APIs validadas |
| Pruebas E2E Completas | Día 20 | Flujos principales validados |
| Pruebas de Sistema Completas | Día 25 | Seguridad y rendimiento OK |
| Regresión Completa | Día 28 | 0 defectos críticos |
| UAT Completa | Día 33 | Aprobación de stakeholders |
| Reporte Final | Día 35 | Documento de cierre |

---

## 10. Gestión de Defectos

### 10.1 Clasificación de Defectos

#### Severidad

| Nivel | Descripción | Ejemplo | Tiempo de Resolución |
|-------|-------------|---------|----------------------|
| **Crítica** | Sistema no funcional o pérdida de datos | - No se pueden crear pedidos<br>- Pérdida de datos en MongoDB<br>- Sistema no arranca | 24 horas |
| **Alta** | Funcionalidad principal afectada | - Edición de pedidos no funciona<br>- WebSocket no conecta<br>- Login falla | 48 horas |
| **Media** | Funcionalidad secundaria afectada | - Dashboard no carga métricas<br>- Paginación no funciona | 1 semana |
| **Baja** | Problema cosmético o menor | - Texto mal alineado<br>- Color incorrecto<br>- Tooltip faltante | 2 semanas |

#### Prioridad

| Nivel | Descripción | Criterio |
|-------|-------------|----------|
| **P0** | Bloqueante | Impide continuar pruebas |
| **P1** | Crítico | Afecta funcionalidad principal |
| **P2** | Alto | Afecta funcionalidad secundaria |
| **P3** | Medio | Mejora o problema menor |
| **P4** | Bajo | Cosmético |

### 10.2 Proceso de Gestión de Defectos

1. **Detección:** QA identifica el defecto durante pruebas
2. **Registro:** Se crea ticket en Jira con:
   - Título descriptivo
   - Pasos para reproducir
   - Resultado esperado vs obtenido
   - Screenshots/logs
   - Severidad y prioridad
   - Entorno
3. **Triaje:** QA Lead revisa y asigna
4. **Corrección:** Desarrollador corrige el defecto
5. **Verificación:** QA valida la corrección
6. **Cierre:** Si está OK, se cierra el ticket

### 10.3 Métricas de Defectos

- **Defectos por módulo**
- **Defectos por severidad**
- **Tiempo promedio de resolución**
- **Tasa de reapertura**
- **Defectos encontrados vs corregidos**

---

## 11. Riesgos y Mitigación

### 11.1 Riesgos Identificados

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|--------------|---------|------------|
| R-01 | Entorno de pruebas inestable | Media | Alto | - Configuración con Docker Compose<br>- Scripts de inicialización<br>- Documentación clara |
| R-02 | Falta de datos de prueba | Baja | Medio | - Scripts de seed data<br>- Datos de prueba documentados |
| R-03 | Defectos críticos tardíos | Media | Alto | - Pruebas tempranas<br>- Revisiones de código<br>- Pruebas unitarias |
| R-04 | Cambios de requerimientos | Media | Alto | - Comunicación constante<br>- Documentación actualizada<br>- Pruebas de regresión |
| R-05 | Falta de recursos QA | Baja | Alto | - Automatización de pruebas<br>- Desarrolladores apoyan testing |
| R-06 | Problemas de integración | Media | Alto | - Pruebas de integración tempranas<br>- Contratos de API claros |
| R-07 | Rendimiento insuficiente | Baja | Medio | - Pruebas de carga tempranas<br>- Monitoreo continuo |

---

## 12. Reportes y Comunicación

### 12.1 Reportes Diarios
**Frecuencia:** Diaria  
**Audiencia:** Equipo de desarrollo, QA Lead  
**Contenido:**
- Casos ejecutados hoy
- Casos aprobados/fallidos
- Defectos nuevos
- Bloqueantes

### 12.2 Reportes Semanales
**Frecuencia:** Semanal  
**Audiencia:** Stakeholders, Product Owner  
**Contenido:**
- Progreso general (% completado)
- Casos ejecutados vs planificados
- Defectos por severidad
- Riesgos y bloqueantes
- Próximos pasos

### 12.3 Reporte Final
**Frecuencia:** Al finalizar pruebas  
**Audiencia:** Todos los stakeholders  
**Contenido:**
- Resumen ejecutivo
- Cobertura de pruebas
- Defectos encontrados y corregidos
- Métricas de calidad
- Recomendaciones
- Lecciones aprendidas
- Aprobación para producción

---

## 13. Criterios de Aceptación

### 13.1 Funcionales
- ✅ Todos los requerimientos funcionales implementados
- ✅ Flujos principales funcionan correctamente
- ✅ Validaciones de entrada funcionan
- ✅ Mensajes de error son claros

### 13.2 No Funcionales

#### Rendimiento
- ✅ APIs responden en <500ms (promedio)
- ✅ Frontend carga en <2 segundos
- ✅ Sistema procesa >100 pedidos/hora
- ✅ WebSocket mantiene conexión estable

#### Seguridad
- ✅ Autenticación JWT funciona
- ✅ RBAC implementado correctamente
- ✅ Validación contra SQL injection
- ✅ Validación contra XSS
- ✅ CORS configurado correctamente

#### Usabilidad
- ✅ Interfaz intuitiva por rol
- ✅ Responsive en tablets (768px+)
- ✅ Mensajes de error claros
- ✅ Navegación fluida

#### Resiliencia
- ✅ Reconexión automática (WebSocket, RabbitMQ)
- ✅ Retry logic funciona
- ✅ Dead Letter Queue configurada
- ✅ Manejo de fallos de BD

---

## 14. Aprobaciones

### 14.1 Aprobación del Plan de Pruebas

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| QA Lead | _________________ | _________________ | _________________ |
| Tech Lead | _________________ | _________________ | _________________ |
| Product Owner | _________________ | _________________ | _________________ |
| Stakeholder | _________________ | _________________ | _________________ |

### 14.2 Aprobación para Producción

**Criterios:**
- ✅ Todos los criterios de salida cumplidos
- ✅ Reporte final aprobado
- ✅ 0 defectos críticos abiertos
- ✅ <3 defectos altos abiertos
- ✅ UAT aprobada
- ✅ Documentación completa

**Aprobación:**

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| QA Lead | _________________ | _________________ | _________________ |
| Tech Lead | _________________ | _________________ | _________________ |
| Product Owner | _________________ | _________________ | _________________ |

---

## 15. Anexos

### 15.1 Referencias
- `QA_REQUERIMIENTOS.md` - Requerimientos funcionales y no funcionales
- `TEST_CASES.md` - Casos de prueba detallados
- `REFINED_BACKLOG.md` - Historias de usuario
- `README.md` - Guía de instalación y configuración
- `BUSINESS_CONTEXT.md` - Contexto de negocio

### 15.2 Glosario
- **RBAC:** Role-Based Access Control
- **JWT:** JSON Web Token
- **E2E:** End-to-End
- **UAT:** User Acceptance Testing
- **DLQ:** Dead Letter Queue
- **AMQP:** Advanced Message Queuing Protocol
- **CORS:** Cross-Origin Resource Sharing
- **XSS:** Cross-Site Scripting

### 15.3 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-12-17 | QA Team | Creación inicial del documento |

---

**Fin del Test Plan**

*Este documento es confidencial y de uso exclusivo del proyecto Sistema de Pedidos de Restaurante.*
