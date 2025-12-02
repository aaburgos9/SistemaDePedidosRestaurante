# Refactorización Microservicio de Pedidos (Python)

## Cambios principales

- Aplicación de principios SOLID y Clean Code en servicios y controladores.

- Implementación del patrón Repository para desacoplar la lógica de negocio de la persistencia.

- Soporte para edición de órdenes solo si su estado no es "preparando".
- Nuevos endpoints:
  - `PUT /api/v1/orders/{order_id}`: Editar orden (solo si no está en preparación).
  - `GET /api/v1/orders/{order_id}`: Obtener orden por ID.
- Modelos Pydantic actualizados con campo `status`.
- Pruebas unitarias para creación y edición de órdenes, incluyendo reglas de negocio.

## Estructura

- `repositories/order_repository.py`: Interfaz y repositorio en memoria.
- `services/order_service.py`: Lógica de negocio desacoplada.
- `controllers/order_controller.py`: Endpoints RESTful.
- `models/order.py`: Modelos con validación y estado.

## Ejecución de pruebas

```bash
pytest test_order_service.py
o
py -m pytest test_order_service.py
``` 

## Notas
- El repositorio es fácilmente reemplazable por una implementación con base de datos.
- La lógica de edición es extensible para futuras reglas de negocio.
