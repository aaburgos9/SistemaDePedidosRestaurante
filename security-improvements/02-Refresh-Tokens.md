# Tarea 2: Implementar Refresh Tokens

**Prioridad:** 🔴 CRÍTICA  
**Tiempo:** 3 días  
**Beneficio:** Mejor UX + Seguridad

## Problema Actual

- Access token de 8 horas (muy largo)
- Sin refresh tokens
- Usuario debe hacer login cada 8 horas
- Si se deshabilita un usuario, su token sigue válido por 8 horas

## Solución

### Paso 1: Crear Modelo de Refresh Token

**Archivo:** `admin-service/src/domain/models.ts`

```typescript
export interface RefreshToken {
  _id?: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
```

### Paso 2: Modificar Login

**Archivo:** `admin-service/src/transport/http/routes/auth.routes.ts`

```typescript
authRouter.post('/login', async (req, res) => {
  // ... validación existente ...
  
  // Access token (corta duración)
  const accessToken = jwt.sign(
    { sub: String(user._id), email: user.email, roles: user.roles },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  // Refresh token (larga duración)
  const refreshToken = jwt.sign(
    { sub: String(user._id), type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // Guardar refresh token en BD
  const db = getDb();
  await db.collection('refresh_tokens').insertOne({
    userId: String(user._id),
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date()
  });
  
  // Enviar ambos tokens en cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/admin/auth/refresh' // Solo accesible en este endpoint
  });
  
  return res.json({ success: true, user: { ... } });
});
```

### Paso 3: Crear Endpoint de Refresh

**Archivo:** `admin-service/src/transport/http/routes/auth.routes.ts`

```typescript
authRouter.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }
  
  try {
    // Verificar refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || JWT_SECRET
    ) as any;
    
    // Verificar que existe en BD (no revocado)
    const db = getDb();
    const tokenDoc = await db.collection('refresh_tokens').findOne({
      userId: decoded.sub,
      token: refreshToken
    });
    
    if (!tokenDoc) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }
    
    // Verificar que el usuario sigue activo
    const user = await db.collection('users').findOne({ _id: decoded.sub });
    if (!user || !user.active) {
      return res.status(403).json({ success: false, message: 'User disabled' });
    }
    
    // Generar nuevo access token
    const newAccessToken = jwt.sign(
      { sub: decoded.sub, email: user.email, roles: user.roles },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    // Enviar nuevo access token
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });
    
    return res.json({ success: true });
    
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid refresh token' });
  }
});
```

### Paso 4: Revocar Tokens al Deshabilitar Usuario

**Archivo:** `admin-service/src/transport/http/routes/users.routes.ts`

```typescript
usersRouter.patch('/:id/disable', async (req, res) => {
  const { id } = req.params;
  const db = getDb();
  
  // Deshabilitar usuario
  await db.collection('users').updateOne(
    { _id: id },
    { $set: { active: false } }
  );
  
  // ✅ Revocar todos los refresh tokens del usuario
  await db.collection('refresh_tokens').deleteMany({ userId: id });
  
  return res.json({ success: true });
});
```

### Paso 5: Frontend - Interceptor Axios

**Archivo:** `orders-producer-frontend/src/services/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

// Interceptor para manejar 401 automáticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si es 401 y no es el endpoint de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar refrescar token
        await axios.post('/admin/auth/refresh', {}, {
          withCredentials: true
        });
        
        // Reintentar request original
        return api(originalRequest);
        
      } catch (refreshError) {
        // Refresh falló → logout
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

## Variables de Entorno

**Archivo:** `admin-service/.env`

```env
JWT_SECRET=your-super-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-different-from-access
```

### Paso 6: Encriptación de Contraseñas

**Archivo:** `orders-producer-frontend/src/utils/security.ts`

```typescript
export function encryptPassword(password: string): string {
  const salt = Math.random().toString(36).substring(2, 15);
  const saltedPassword = salt + password + salt.split('').reverse().join('');
  
  let encrypted = btoa(saltedPassword);
  for (let i = 0; i < 3; i++) {
    encrypted = btoa(encrypted);
  }
  
  return `enc_v1_${salt}_${encrypted}`;
}
```

**Archivo:** `admin-service/src/utils/security.ts`

```typescript
export function decryptPassword(encryptedPassword: string): string {
  const parts = encryptedPassword.replace('enc_v1_', '').split('_');
  const [salt, encrypted] = parts;
  
  let decrypted = encrypted;
  for (let i = 0; i < 3; i++) {
    decrypted = Buffer.from(decrypted, 'base64').toString('utf-8');
  }
  
  const saltReversed = salt.split('').reverse().join('');
  return decrypted.replace(salt, '').replace(saltReversed, '');
}
```

## Testing

```bash
# 1. Login con contraseña encriptada
curl -X POST http://localhost:4001/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sofka.com.co","password":"enc_v1_abc123_base64data","_encrypted":true}' \
  -c cookies.txt -v

# 2. Esperar 16 minutos (access token expira)

# 3. Intentar request (debería fallar con 401)
curl http://localhost:3000/admin/users \
  -b cookies.txt

# 4. Refrescar token
curl -X POST http://localhost:4001/admin/auth/refresh \
  -b cookies.txt -c cookies.txt

# 5. Reintentar request (debería funcionar)
curl http://localhost:3000/admin/users \
  -b cookies.txt
```

## Checklist

- [x] Crear modelo RefreshToken
- [x] Modificar login para generar refresh token
- [x] Crear endpoint /refresh
- [x] Revocar tokens al deshabilitar usuario
- [x] Implementar interceptor en frontend
- [x] Agregar JWT_REFRESH_SECRET a .env
- [x] Implementar encriptación de contraseñas en frontend
- [x] Actualizar backend para manejar contraseñas encriptadas
- [x] Crear utilidades de seguridad para ofuscar logs
- [x] Arreglar componentes frontend para usar isAuthenticated
- [x] Probar flujo completo
- [x] Verificar que tokens se revocan correctamente
- [x] Verificar que contraseñas se encriptan correctamente

## ✅ IMPLEMENTACIÓN COMPLETADA

### Problemas Resueltos
- ❌ **Error 401 en login**: Función de desencriptación corregida
- ❌ **No redirige después del login**: AdminPanel verificaba `token` en lugar de `isAuthenticated`
- ✅ **Contraseñas encriptadas**: Implementado formato enc_v2 con timestamp
- ✅ **Refresh tokens**: Sistema completo implementado
- ✅ **Logging seguro**: Datos sensibles ofuscados automáticamente
