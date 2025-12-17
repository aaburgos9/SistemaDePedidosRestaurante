## Estructura del Proyecto

```
admin-service/
├── Dockerfile         # Imagen para despliegue en contenedores
├── jest.config.js     # Configuración de Jest para testing
├── package.json       # Dependencias y scripts del proyecto
├── README.md          # Documentación principal
├── tsconfig.json      # Configuración de TypeScript
├── coverage/          # Reportes de cobertura de tests
└── src/               # Código fuente principal
		├── index.html     # Página base/documentación embebida
		├── server.ts      # Entrada principal del servidor Express
		├── startup.ts     # Inicialización y configuración de la app
		├── __tests__/     # Pruebas unitarias e integración
		├── domain/        # Lógica de negocio y modelos
		├── startup/       # Configuración de dependencias y servicios
		├── storage/       # Acceso a datos y persistencia
		└── transport/     # Controladores y rutas HTTP
```

Cada archivo/carpeta cumple una función específica:
- **Dockerfile**: Permite crear la imagen Docker para despliegue.
- **jest.config.js**: Define cómo se ejecutan los tests.
- **package.json**: Lista dependencias, scripts y metadatos.
- **README.md**: Documentación del servicio.
- **tsconfig.json**: Opciones de compilación TypeScript.
- **coverage/**: Resultados de cobertura de pruebas.
- **src/**: Todo el código fuente del servicio.
	- **index.html**: Puede usarse para documentación o pruebas rápidas.
	- **server.ts**: Arranque del servidor Express.
	- **startup.ts**: Configuración inicial (DB, middlewares, etc).
	- **__tests__/**: Pruebas automáticas.
	- **domain/**: Entidades, lógica de negocio y validaciones.
	- **startup/**: Inyección de dependencias y configuración de servicios.
	- **storage/**: Repositorios y acceso a la base de datos.
	- **transport/**: Controladores, rutas y manejo HTTP.
    
# Admin Service — Gestión de Pedidos Rápido y Sabroso

Servicio administrativo para usuarios, roles, productos y dashboard operativo.

- Puerto: 4001
- DB: MongoDB (compartida con Node-MS: `orders_db`)
- Seguridad: JWT (header `Authorization: Bearer <token>`)
- Testing: Jest + MongoMemoryServer
- Cobertura: 78.83% (119 tests pasando)

## Endpoints

**Auth**
- POST /admin/auth/login { email, password } → { token, user }

**Usuarios**
- POST /admin/users
- GET /admin/users?role=admin&active=true&name=john
- PUT /admin/users/:id
- PATCH /admin/users/:id/role

**Productos**
- POST /admin/products
- GET /admin/products
- PUT /admin/products/:id
- PATCH /admin/products/:id/toggle

**Categorías**
- POST /admin/categories
- GET /admin/categories
- PUT /admin/categories/:id

**Dashboard**
- GET /admin/dashboard/orders (conteo por estado + recientes)
- GET /admin/dashboard/metrics (órdenes, productos activos)

## Variables de entorno
```
PORT=4001
MONGO_URI=mongodb://mongo:27017/
MONGO_DB=orders_db
JWT_SECRET=change-me
CORS_ORIGIN=http://localhost:5173
```

## Desarrollo
```bash
npm install
npm run dev
npm test                    # Ejecutar tests
npm test -- --coverage      # Tests con cobertura
```

## Tests
- **119 tests pasando** (100% éxito)
- **78.83% cobertura** de código
- 6 suites: auth, users, categories, products, dashboard, routes
- Aislamiento: MongoMemoryServer para no afectar DB

## Producción
```bash
npm run build
npm start
```

