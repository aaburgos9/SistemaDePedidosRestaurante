# Módulo de Administración — Gestión de Pedidos Rápido y Sabroso

Objetivo: Gestionar usuarios/roles, productos del menú y monitorear en tiempo real la operación, sin romper los flujos actuales.

## Arquitectura
- Frontend (React/Vite): módulo AdminPanel (login, sidebar, CRUDs, dashboard)
- API Gateway (TS): expone `/api/admin/*`, valida JWT y rol `admin`, y proxifica a admin-service
- Admin-Service (Node/TS): persiste usuarios y productos en Mongo; entrega métricas y snapshot de órdenes
- Node-MS: sigue publicando WebSocket y guardando órdenes en Mongo
- Python-MS: sin cambios; mantiene flujo actual de creación de pedidos

Flujo (alto nivel):
1) Admin se loguea → Gateway → Admin-Service (emite JWT)
2) Front usa JWT en todas las llamadas `/api/admin/*`
3) Gateway valida JWT + rol, proxifica a Admin-Service
4) Admin-Service gestiona `users`, `products`, y lee `orders` en Mongo para dashboard

## Endpoints
- Auth: `POST /api/admin/auth/login`
- Users: `POST/GET /api/admin/users`, `PUT /api/admin/users/:id`, `PATCH /api/admin/users/:id/role`
- Products: `POST/GET /api/admin/products`, `PUT /api/admin/products/:id`, `PATCH /api/admin/products/:id/toggle`
- Dashboard: `GET /api/admin/dashboard/orders`, `GET /api/admin/dashboard/metrics`

## Modelos
Usuarios
```
{
  name, email (único), passwordHash, roles: ['waiter'|'cook'|'admin'], active: boolean,
  createdAt, updatedAt
}
```
Productos (colección `products`, compartida con Node-MS)
```
{ id?: number, name, price, description, image, enabled, category?, createdAt, updatedAt }
```

## Seguridad
- JWT unificado (`JWT_SECRET` compartido por gateway y admin-service)
- Gateway aplica `verifyJWT` y `requireRole('admin')` en `/api/admin/*`
- Admin-Service también verifica JWT (defense-in-depth)

## Docker Compose
- Servicio nuevo `admin-service` en puerto 4001
- `ADMIN_MS_URL` en gateway para proxy
- Reusa `mongo` del stack actual

## Frontend Admin (ubicación)
- Páginas en `orders-producer-frontend/src/pages/admin/`
- Estado de auth: `orders-producer-frontend/src/store/auth.ts`
- API: `orders-producer-frontend/src/services/adminService.ts`

## Diagrama de Secuencia (simplificado)

Login Admin
```
Admin UI → Gateway (/api/admin/auth/login) → Admin-Service → JWT
Admin UI ⇐ JWT ⇐ Gateway ⇐ Admin-Service
```

CRUD Usuarios/Productos
```
Admin UI (+JWT) → Gateway (/api/admin/...) [verifyJWT+role] → Admin-Service → Mongo
Admin UI ⇐ respuesta ⇐ Gateway ⇐ Admin-Service
```

Dashboard
```
Admin UI (+JWT) → Gateway (/api/admin/dashboard/*) → Admin-Service → Mongo(orders, products)
Admin UI ⇐ métricas/snapshot ⇐ Gateway ⇐ Admin-Service
```
