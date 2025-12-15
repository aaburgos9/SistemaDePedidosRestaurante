# ⏱️ Configuración de Tiempos de Preparación

Los tiempos de preparación de productos ahora se cargan desde **MongoDB** en lugar de estar hardcodeados en el código.

## 📊 Estructura de la Base de Datos

### Colección: `preparation_times`

```typescript
{
  _id: ObjectId,
  productName: string,        // Nombre exacto del producto (ej: "Hamburguesa", "Papas fritas")
  secondsPerUnit: number,     // Segundos por unidad del producto
  enabled: boolean,            // Si está habilitado o no
  createdAt: Date,
  updatedAt: Date
}
```

### Índices

- `productName`: único (único por nombre de producto)
- `enabled`: para consultas rápidas de productos habilitados

## 🚀 Uso

### 1. Poblar la base de datos con valores iniciales

```bash
# Asegúrate de tener MongoDB corriendo y configurado en .env
npx ts-node src/scripts/seed-preparation-times.ts
```

Esto creará los siguientes tiempos por defecto:
- `Hamburguesa`: 10 segundos por unidad
- `Papas fritas`: 4 segundos por unidad
- `Perro caliente`: 6 segundos por unidad
- `Refresco`: 2 segundos por unidad

### 2. Agregar nuevos productos

Puedes agregar nuevos productos directamente en MongoDB:

```javascript
// En MongoDB shell o Compass
db.preparation_times.insertOne({
  productName: "Pizza",
  secondsPerUnit: 15,
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

O usando el repositorio en código:

```typescript
import { PreparationTimeRepository } from "./repositories/preparation-time.repository";

const repo = new PreparationTimeRepository();
await repo.upsert({
  productName: "Pizza",
  secondsPerUnit: 15,
  enabled: true
});
```

### 3. Matching por Nombre

El campo `productName` hace matching **exacto** pero **case-insensitive** (no distingue mayúsculas/minúsculas). 

Ejemplos:
- `"Hamburguesa"` coincide con `"Hamburguesa"`, `"hamburguesa"`, `"HAMBURGUESA"`
- `"Papas fritas"` coincide con `"Papas fritas"`, `"papas fritas"`, `"PAPAS FRITAS"`
- `"Pizza"` coincide solo con `"Pizza"` (o variaciones de mayúsculas/minúsculas)

**Importante:** El nombre debe coincidir exactamente (ignorando mayúsculas/minúsculas) con el nombre del producto que viene en el pedido.

## 🔄 Fallback

Si MongoDB no está disponible o la colección está vacía, el sistema usa valores por defecto:

- Hamburguesa: 10s
- Papas fritas: 4s
- Perro caliente: 6s
- Refresco/Limonada: 2s

## 📝 Variables de Entorno

**DEPRECATED:** La variable de entorno `PREPARATION_STRATEGIES` ya no se usa. 
Todos los tiempos de preparación se obtienen desde MongoDB.

Si necesitas cambiar tiempos, modifica directamente en la base de datos:

```javascript
db.preparation_times.updateOne(
  { productName: "Hamburguesa" },
  { $set: { secondsPerUnit: 15, updatedAt: new Date() } }
);
```

## 🎯 Ventajas

✅ **Escalable**: Agregar productos sin recompilar  
✅ **Dinámico**: Cambiar tiempos sin reiniciar el servicio  
✅ **Administrable**: Gestionar desde interfaz o scripts  
✅ **Resiliente**: Fallback automático si MongoDB falla  
✅ **Testeable**: Fácil de mockear en tests  

## 🔍 Consultas Útiles

```javascript
// Ver todos los tiempos habilitados
db.preparation_times.find({ enabled: true })

// Deshabilitar un producto
db.preparation_times.updateOne(
  { productName: "Hamburguesa" },
  { $set: { enabled: false } }
)

// Cambiar tiempo de preparación
db.preparation_times.updateOne(
  { productName: "Papas fritas" },
  { $set: { secondsPerUnit: 5, updatedAt: new Date() } }
)

// Buscar un producto específico
db.preparation_times.findOne({ productName: "Pizza" })
```

