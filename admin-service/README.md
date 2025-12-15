# Admin Service — Gestión de Pedidos Rápido y Sabroso

Servicio administrativo para usuarios, roles, productos y dashboard operativo.

- Puerto: 4001
- DB: MongoDB (compartida con Node-MS: `orders_db`)
- Seguridad: JWT (header `Authorization: Bearer <token>`)

## Endpoints

Auth
- POST /admin/auth/login { email, password } → { token, user }

Usuarios
- POST /admin/users
- GET /admin/users?role=admin&active=true&name=john
- PUT /admin/users/:id
- PATCH /admin/users/:id/role

Productos
- POST /admin/products
- GET /admin/products
- PUT /admin/products/:id
- PATCH /admin/products/:id/toggle

Dashboard
- GET /admin/dashboard/orders (conteo por estado + recientes)
- GET /admin/dashboard/metrics (órdenes, productos activos, cola RabbitMQ opcional)

## Variables de entorno
- PORT=4001
- MONGO_URI=mongodb://mongo:27017/
- MONGO_DB=orders_db
- JWT_SECRET=change-me
- CORS_ORIGIN=http://localhost:5173

## Desarrollo
```bash
npm install
npm run dev
```

## Producción
```bash
npm run build
npm start
```
