# 🍔 Gestión de Productos desde MongoDB

Los productos del menú ahora se cargan desde **MongoDB** en lugar de estar hardcodeados en el código.

## 📊 Estructura de la Base de Datos

### Colección: `products`

```typescript
{
  _id: ObjectId,
  id: number,              // ID numérico para compatibilidad con frontend
  name: string,            // Nombre del producto (ej: "Hamburguesa", "Papas fritas")
  price: number,          // Precio en COP
  description: string,     // Descripción del producto
  image: string,          // Ruta de la imagen (ej: "/images/hamburguesa.jpg")
  enabled: boolean,       // Si está habilitado en el menú
  createdAt: Date,
  updatedAt: Date
}
```

### Índices

- `id`: único (único por ID numérico)
- `name`: único (único por nombre de producto)
- `enabled`: para consultas rápidas de productos habilitados

## 🚀 Uso

### 1. Poblar la base de datos con productos iniciales

```bash
# Asegúrate de tener MongoDB corriendo y configurado en .env
npx ts-node src/scripts/seed-products.ts
```

Esto creará los siguientes productos por defecto:
- `Hamburguesa`: $10.500
- `Papas fritas`: $12.000
- `Perro caliente`: $8.000
- `Refresco`: $7.000

### 2. Endpoints API

#### GET `/api/products`
Obtiene todos los productos habilitados (para el frontend)

```bash
curl http://localhost:3002/api/products
```

Respuesta:
```json
[
  {
    "_id": "...",
    "id": 1,
    "name": "Hamburguesa",
    "price": 10500,
    "description": "Hamburguesa",
    "image": "/images/hamburguesa.jpg",
    "enabled": true
  },
  ...
]
```

#### GET `/api/products/all`
Obtiene todos los productos (incluyendo deshabilitados) - para administración

```bash
curl http://localhost:3002/api/products/all
```

#### GET `/api/products/:id`
Obtiene un producto específico por ID

```bash
curl http://localhost:3002/api/products/1
```

### 3. Agregar nuevos productos

Puedes agregar nuevos productos directamente en MongoDB:

```javascript
// En MongoDB shell o Compass
db.products.insertOne({
  id: 5,
  name: "Pizza",
  price: 15000,
  description: "Pizza mediana",
  image: "/images/pizza.jpg",
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

O usando el repositorio en código:

```typescript
import { ProductRepository } from "./repositories/product.repository";

const repo = new ProductRepository();
await repo.upsert({
  id: 5,
  name: "Pizza",
  price: 15000,
  description: "Pizza mediana",
  image: "/images/pizza.jpg",
  enabled: true
});
```

### 4. Deshabilitar un producto

```javascript
// En MongoDB shell o Compass
db.products.updateOne(
  { id: 1 },
  { $set: { enabled: false, updatedAt: new Date() } }
);
```

O usando el repositorio:

```typescript
const repo = new ProductRepository();
await repo.disable(1);
```

## 🎯 Ventajas

✅ **Escalable**: Agregar productos sin recompilar  
✅ **Dinámico**: Cambiar precios sin reiniciar el servicio  
✅ **Administrable**: Gestionar desde interfaz o scripts  
✅ **Resiliente**: Fallback automático si MongoDB falla  
✅ **Testeable**: Fácil de mockear en tests  
✅ **Consistente**: Mismo patrón que `preparation_times`  

## 🔍 Consultas Útiles

```javascript
// Ver todos los productos habilitados
db.products.find({ enabled: true })

// Ver productos ordenados por precio
db.products.find({ enabled: true }).sort({ price: 1 })

// Buscar producto por nombre
db.products.findOne({ name: "Hamburguesa" })

// Actualizar precio de un producto
db.products.updateOne(
  { id: 1 },
  { $set: { price: 11000, updatedAt: new Date() } }
)

// Contar productos habilitados
db.products.countDocuments({ enabled: true })
```

## 🔗 Integración con Frontend

El frontend puede consumir los productos desde el endpoint:

```typescript
// En el frontend (React)
const [products, setProducts] = useState([]);

useEffect(() => {
  fetch('http://localhost:3002/api/products')
    .then(res => res.json())
    .then(data => setProducts(data));
}, []);
```

## 📝 Notas Importantes

1. **ID numérico**: Se mantiene el campo `id` numérico para compatibilidad con el frontend existente
2. **Nombres únicos**: El nombre del producto debe ser único (case-sensitive)
3. **Habilitación**: Solo los productos con `enabled: true` se devuelven en `/api/products`
4. **Imágenes**: Las rutas de imágenes deben ser relativas desde la raíz pública del frontend

