# Tarea 3: Prevenir NoSQL Injection

**Prioridad:** 🔴 CRÍTICA  
**Tiempo:** 1 día  
**Riesgo Actual:** Sistema completamente expuesto

## Problema Actual

Sin validación, el sistema es vulnerable a NoSQL Injection:

```javascript
// ❌ Ataque posible
POST /api/auth/login
{
  "email": { "$ne": null },
  "password": { "$ne": null }
}
// → Login sin credenciales
```

## Solución

### Paso 1: Instalar Dependencias

```bash
cd admin-service
npm install express-mongo-sanitize joi

cd api-gateway
npm install express-mongo-sanitize joi

cd orders-producer-node
npm install express-mongo-sanitize joi
```

### Paso 2: Middleware Global de Sanitización

**Archivo:** `admin-service/src/startup.ts`

```typescript
import mongoSanitize from 'express-mongo-sanitize';

export async function startServer() {
  // ... código existente ...
  
  const app = express();
  app.use(cookieParser());
  
  // ✅ Sanitizar ANTES de procesar requests
  app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`⚠️ Sanitized malicious key: ${key} from ${req.ip}`);
    }
  }));
  
  app.use(cors({ ... }));
  app.use(json());
  
  // ... resto del código ...
}
```

### Paso 3: Validación con Joi

**Archivo:** `admin-service/src/transport/http/routes/auth.routes.ts`

```typescript
import { z } from 'zod';

// ✅ Schema estricto
const LoginSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(8).max(100)
});

authRouter.post('/login', async (req, res) => {
  // ✅ Validar entrada
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid payload',
      errors: parsed.error.errors
    });
  }
  
  const { email, password } = parsed.data;
  
  // Ahora es seguro usar en MongoDB
  const db = getDb();
  const user = await db.collection('users').findOne({ email });
  
  // ... resto del código ...
});
```

### Paso 4: Schemas para Pedidos

**Archivo:** `orders-producer-python/app/schemas/order.py`

```python
from pydantic import BaseModel, Field, validator
from typing import List
import re

class OrderItem(BaseModel):
    productName: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(..., gt=0, le=100)
    unitPrice: float = Field(..., ge=0)
    note: str = Field(default="", max_length=500)
    
    @validator('productName', 'note')
    def sanitize_string(cls, v):
        # Eliminar caracteres peligrosos
        if '$' in v or '.' in v:
            raise ValueError('Invalid characters in string')
        return v

class CreateOrderRequest(BaseModel):
    customerName: str = Field(..., min_length=1, max_length=100)
    table: str = Field(..., min_length=1, max_length=50)
    items: List[OrderItem] = Field(..., min_items=1)
    
    @validator('customerName', 'table')
    def sanitize_string(cls, v):
        if '$' in v or '.' in v:
            raise ValueError('Invalid characters in string')
        return v
```

### Paso 5: Validación en Node.js

**Archivo:** `orders-producer-node/src/infrastructure/http/validators/order.validator.ts`

```typescript
import Joi from 'joi';

export const createOrderSchema = Joi.object({
  customerName: Joi.string().min(1).max(100).required(),
  table: Joi.string().min(1).max(50).required(),
  items: Joi.array().items(
    Joi.object({
      productName: Joi.string().min(1).max(100).required(),
      quantity: Joi.number().integer().min(1).max(100).required(),
      unitPrice: Joi.number().min(0).required(),
      note: Joi.string().max(500).allow('').optional()
    })
  ).min(1).required()
});

export const updateOrderSchema = Joi.object({
  status: Joi.string().valid('pending', 'preparing', 'ready', 'completed'),
  items: Joi.array().items(
    Joi.object({
      productName: Joi.string().min(1).max(100).required(),
      quantity: Joi.number().integer().min(1).max(100).required(),
      unitPrice: Joi.number().min(0).required(),
      note: Joi.string().max(500).allow('').optional()
    })
  ).min(1)
}).min(1);

// Middleware de validación
export function validate(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(d => d.message);
      return res.status(400).json({ success: false, errors });
    }
    
    req.body = value; // Usar datos validados
    next();
  };
}
```

### Paso 6: Aplicar Validación en Rutas

**Archivo:** `orders-producer-node/src/infrastructure/http/routes/orders.routes.ts`

```typescript
import { validate, createOrderSchema, updateOrderSchema } from '../validators/order.validator';

router.post('/orders', validate(createOrderSchema), async (req, res) => {
  // req.body ya está validado y sanitizado
  const orderData = req.body;
  // ... procesar pedido ...
});

router.patch('/orders/:id', validate(updateOrderSchema), async (req, res) => {
  // req.body ya está validado y sanitizado
  const updates = req.body;
  // ... actualizar pedido ...
});
```

## Testing de Seguridad

```bash
# Test 1: Intentar NoSQL Injection en login
curl -X POST http://localhost:4001/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$ne":null},"password":{"$ne":null}}'
# Esperado: 400 Bad Request

# Test 2: Intentar operador MongoDB en pedido
curl -X POST http://localhost:8000/api/v1/orders/ \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": {"$ne": null},
    "table": "Mesa 1",
    "items": [{"productName": "Hamburguesa", "quantity": 1, "unitPrice": 10000}]
  }'
# Esperado: 400 Bad Request

# Test 3: Intentar $where injection
curl -X POST http://localhost:8000/api/v1/orders/ \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test",
    "table": {"$where": "this.table == \"Mesa 1\""},
    "items": []
  }'
# Esperado: 400 Bad Request
```

## Checklist

- [ ] Instalar express-mongo-sanitize y joi
- [ ] Agregar middleware de sanitización global
- [ ] Crear schemas de validación para todos los endpoints
- [ ] Aplicar validación en todas las rutas
- [ ] Probar ataques de NoSQL Injection
- [ ] Verificar logs de sanitización
- [ ] Documentar schemas en README
