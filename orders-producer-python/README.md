# Orders Producer Python — Microservicio de Pedidos

Servicio backend en Python para la gestión de pedidos, integración con RabbitMQ y lógica de negocio del sistema de restaurante.

- Puerto: 8000 (por defecto)
- Framework: FastAPI
- Broker: RabbitMQ
- Testing: pytest

## Estructura del Proyecto
```
orders-producer-python/
├── Dockerfile           # Imagen para despliegue en contenedores
├── requirements.txt     # Dependencias del proyecto
├── test_order_service.py# Pruebas unitarias principales
├── app/                 # Código fuente principal
│   ├── __init__.py      # Inicialización del paquete
│   ├── config.py        # Configuración y variables de entorno
│   ├── main.py          # Entrada principal (FastAPI)
│   ├── controllers/     # Controladores de rutas
│   ├── messaging/       # Integración con RabbitMQ
│   ├── models/          # Modelos y esquemas de datos
│   ├── repositories/    # Acceso a datos y persistencia
│   └── services/        # Lógica de negocio
```

Cada archivo/carpeta cumple una función específica:
- **Dockerfile**: Permite crear la imagen Docker para despliegue.
- **requirements.txt**: Lista de dependencias de Python.
- **test_order_service.py**: Pruebas unitarias principales.
- **app/**: Todo el código fuente del microservicio.
  - **__init__.py**: Inicialización del paquete.
  - **config.py**: Configuración y variables de entorno.
  - **main.py**: Arranque de la app FastAPI.
  - **controllers/**: Controladores de rutas HTTP.
  - **messaging/**: Integración y lógica de mensajería con RabbitMQ.
  - **models/**: Modelos y esquemas de datos.
  - **repositories/**: Acceso a datos y persistencia.
  - **services/**: Lógica de negocio y casos de uso.

## Endpoints

**Pedidos**
- POST /orders  → Crear un nuevo pedido
- GET /orders   → Listar pedidos existentes

**Salud**
- GET /health   → Verificar estado del microservicio

## Variables de entorno
```
RABBITMQ_URL=amqp://localhost:5672
MONGO_URI=mongodb://mongo:27017/
MONGO_DB=orders_db
PORT=8000
```

## Desarrollo
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
pytest                      # Ejecutar tests
```

## Tests
- Pruebas unitarias con pytest
- Cobertura: ver reporte tras ejecutar tests

## Producción
```bash
docker build -t orders-producer-python .
docker run -p 8000:8000 orders-producer-python
```

## Funcionamiento

1. El microservicio expone endpoints para crear y consultar pedidos.
2. Publica nuevos pedidos en RabbitMQ para ser procesados por la cocina.
3. Utiliza MongoDB para persistencia de pedidos.

## Notas
- Asegúrate de tener RabbitMQ y MongoDB en ejecución.
- Consulta la documentación de FastAPI en `/docs` una vez el servicio esté corriendo.
