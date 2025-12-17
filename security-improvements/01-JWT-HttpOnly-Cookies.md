# Tarea 1: Migrar JWT de LocalStorage a HttpOnly Cookies

**Prioridad:** 🔴 CRÍTICA  
**Tiempo:** 2 días  
**Riesgo Actual:** Vulnerable a XSS

## Problema Actual

```typescript
// ❌ Backend envía token en body
return res.json({ token: "..." });

// ❌ Frontend guarda en LocalStorage
localStorage.setItem('token', token);
```

## Solución

### Paso 1: Modificar Login (Backend)

**Archivo:** `admin-service/src/transport/http/routes/auth.routes.ts`

```typescript
authRouter.post('/login', async (req, res) => {
  // ... validación existente ...
  
  const accessToken = jwt.sign(
    { sub: String(user._id), email: user.email, roles: user.roles },
    JWT_SECRET,
    { expiresIn: '15m' } // ✅ Reducir a 15 minutos
  );
  
  // ✅ Guardar en HttpOnly Cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutos
  });
  
  // ✅ NO enviar token en body
  return res.json({ 
    success: true, 
    user: { id: user._id, name: user.name, email: user.email, roles: user.roles }
  });
});
```

### Paso 2: Instalar cookie-parser

```bash
cd admin-service
npm install cookie-parser
npm install --save-dev @types/cookie-parser
```

### Paso 3: Configurar cookie-parser

**Archivo:** `admin-service/src/startup.ts`

```typescript
import cookieParser from 'cookie-parser';

export async function startServer() {
  // ... código existente ...
  
  const app = express();
  app.use(cookieParser()); // ✅ Agregar ANTES de las rutas
  app.use(cors({ 
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true // ✅ Importante para cookies
  }));
  app.use(json());
  
  // ... resto del código ...
}
```

### Paso 4: Actualizar Middleware de Auth

**Archivo:** `api-gateway/src/middlewares/auth.ts`

```typescript
export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  // ✅ Leer de cookie en lugar de header
  const token = req.cookies.accessToken;
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = { id: payload.sub, email: payload.email, roles: payload.roles || [] };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}
```

### Paso 5: Actualizar Frontend

**Archivo:** `orders-producer-frontend/src/services/auth.ts` (crear si no existe)

```typescript
// ✅ Login
export async function login(email: string, password: string) {
  const response = await fetch('http://localhost:3000/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // ✅ Enviar cookies
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  // ✅ NO guardar token (está en cookie)
  return data.user;
}

// ✅ Requests autenticados
export async function fetchOrders() {
  const response = await fetch('http://localhost:3000/api/orders', {
    credentials: 'include' // ✅ Enviar cookie automáticamente
  });
  
  return response.json();
}
```

### Paso 6: Eliminar LocalStorage

Buscar y eliminar todas las referencias a:
```typescript
localStorage.setItem('token', ...)
localStorage.getItem('token')
localStorage.removeItem('token')
```

## Testing

```bash
# 1. Hacer login
curl -X POST http://localhost:4001/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sofka.com.co","password":"admin123"}' \
  -c cookies.txt

# 2. Verificar que la cookie se guardó
cat cookies.txt

# 3. Hacer request autenticado
curl http://localhost:3000/admin/users \
  -b cookies.txt
```

## Checklist

- [x] Instalar cookie-parser
- [x] Modificar login para usar cookies
- [x] Actualizar middleware de auth
- [x] Actualizar frontend para usar credentials: 'include'
- [x] Eliminar localStorage del código
- [x] Actualizar tests para cookie-based auth
- [x] Probar login y requests autenticados
- [x] Verificar que cookies tienen httpOnly=true

## ✅ IMPLEMENTACIÓN COMPLETADA

### Resultados de Tests
```
Test Suites: 6 passed, 6 total
Tests: 120 passed, 120 total
Coverage: 77.91% statements, 70.14% branches
```

### Archivos Modificados
- ✅ `admin-service/src/transport/http/routes/auth.routes.ts` - Login con HttpOnly cookies
- ✅ `admin-service/src/startup.ts` - Cookie-parser configurado
- ✅ `api-gateway/src/middlewares/auth.ts` - Middleware lee cookies
- ✅ `api-gateway/src/app.ts` - Cookie-parser configurado
- ✅ `orders-producer-frontend/src/services/adminService.ts` - Eliminado localStorage
- ✅ `orders-producer-frontend/src/store/auth.ts` - Auth store sin tokens
- ✅ `orders-producer-frontend/src/pages/admin/*.tsx` - Componentes actualizados
- ✅ `admin-service/src/__tests__/auth.routes.test.ts` - Tests actualizados

### Seguridad Mejorada
🔒 **XSS Protection**: Tokens HttpOnly no accesibles desde JavaScript  
🔒 **CSRF Protection**: SameSite=Strict previene ataques cross-site  
🔒 **Reduced Attack Surface**: Sin almacenamiento en localStorage  
🔒 **Short Token Lifetime**: 15 minutos reduce ventana de exposición  
🔒 **Automatic Cookie Management**: Browser maneja tokens de forma segura
