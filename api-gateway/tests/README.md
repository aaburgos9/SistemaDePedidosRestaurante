# Tests del API Gateway

## Principios FIRST

Los tests siguen los principios **FIRST**:

### **F**ast (Rápidos)
- Usan **fake timers** de Jest para evitar delays reales en `retryLogic.test.ts`
- Los mocks evitan llamadas HTTP reales
- Tiempo de ejecución: < 5 segundos para toda la suite

### **I**ndependent (Independientes)
- Cada test usa `beforeEach` para resetear mocks y estado
- No comparten datos entre tests
- Se pueden ejecutar en cualquier orden

### **R**epeatable (Repetibles)
- Usan mocks en lugar de servicios externos
- Variables de entorno configuradas en `tests/setup.ts`
- Resultados consistentes en cualquier entorno

### **S**elf-validating (Auto-verificables)
- Cada test tiene aserciones claras con `expect()`
- No requieren inspección manual
- Pasan ✅ o fallan ❌ automáticamente

### **T**imely (Oportunos)
- Escritos junto con el código de producción
- Cubren casos críticos: éxito, errores, edge cases

---

## Estructura de Tests

```
tests/
├── setup.ts                      # Configuración global
├── unit/                         # Tests unitarios (lógica aislada)
│   ├── ProxyService.test.ts     # Servicio proxy base
│   └── retryLogic.test.ts       # Lógica de reintentos
└── integration/                  # Tests de integración (rutas + middlewares)
    ├── orders.routes.test.ts    # Rutas de pedidos
    └── health.routes.test.ts    # Health checks y bootstrap
```

---

## Ejecutar Tests

### Todos los tests
```bash
npm test
```

### Con cobertura
```bash
npm run test:coverage
```

### Modo watch (desarrollo)
```bash
npm run test:watch
```

### Test específico
```bash
npm test -- retryLogic.test.ts
```

---

## Cobertura Esperada

- **Objetivo:** > 80% de cobertura
- **Áreas críticas:** 100% en `retryLogic` y `ProxyService`
- **Excluido:** `server.ts` (punto de entrada, no lógica de negocio)

---

## Agregar Nuevos Tests

1. Crear archivo `*.test.ts` en `tests/unit/` o `tests/integration/`
2. Seguir la estructura AAA (Arrange, Act, Assert)
3. Usar mocks para dependencias externas
4. Verificar principios FIRST

**Ejemplo:**
```typescript
describe('MiServicio', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Independent
  });

  it('debe hacer algo correctamente', async () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = await miServicio.hacer(input);
    
    // Assert - Self-validating
    expect(result).toBe('expected');
  });
});
```
