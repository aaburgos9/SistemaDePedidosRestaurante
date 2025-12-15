import os
os.environ["CLOUDAMQP_URL"] = "amqp://guest:guest@localhost:5672/"

# Mock de publish_order para evitar conexión real a RabbitMQ
from unittest.mock import patch
patcher = patch("app.messaging.messaging.publish_order", lambda order: None)
patcher.start()

import pytest
from app.models.order import OrderIn, OrderItem
from app.repositories.order_repository import InMemoryOrderRepository
from app.services.order_service import OrderService

@pytest.fixture(scope="session", autouse=True)
def stop_patcher():
    yield
    patcher.stop()

@pytest.fixture
def order_service():
    repo = InMemoryOrderRepository()
    return OrderService(repo)

@pytest.fixture
def sample_order_in():
    return OrderIn(
        customerName="Cliente Test",
        table="Mesa 1",
        items=[OrderItem(productName="Hamburguesa", quantity=2, unitPrice=10000)]
    )

def test_create_order(order_service, sample_order_in):
    order = order_service.create_order(sample_order_in)
    assert order.customerName == "Cliente Test"
    assert order.status == "pendiente"
    assert order.id is not None

def test_update_order_success(order_service, sample_order_in):
    order = order_service.create_order(sample_order_in)
    new_order_in = OrderIn(
        customerName="Cliente Editado",
        table="Mesa 2",
        items=[OrderItem(productName="Papas", quantity=1, unitPrice=5000)]
    )
    updated = order_service.update_order(order.id, new_order_in)
    assert updated.customerName == "Cliente Editado"
    assert updated.table == "Mesa 2"
    assert updated.status == "pendiente"

def test_update_order_preparing(order_service, sample_order_in):
    order = order_service.create_order(sample_order_in)
    # Simular cambio de estado a 'preparando'
    repo = order_service.repository
    order.status = "preparando"
    repo.update(order.id, order)
    new_order_in = OrderIn(
        customerName="No debe editar",
        table="Mesa X",
        items=[OrderItem(productName="Refresco", quantity=1, unitPrice=3000)]
    )
    with pytest.raises(PermissionError):
        order_service.update_order(order.id, new_order_in)

def test_update_order_not_found(order_service, sample_order_in):
    with pytest.raises(ValueError):
        order_service.update_order("no-existe", sample_order_in)

def test_create_order_with_empty_customer_name(order_service):
    """Test que valida que no se puede crear una orden con nombre vacío"""
    from pydantic import ValidationError
    with pytest.raises(ValidationError) as exc_info:
        OrderIn(
            customerName="",
            table="Mesa 1",
            items=[OrderItem(productName="Hamburguesa", quantity=1, unitPrice=10000)]
        )
    assert "customerName must not be empty" in str(exc_info.value)

def test_create_order_with_whitespace_customer_name(order_service):
    """Test que valida que no se puede crear una orden con nombre solo de espacios"""
    from pydantic import ValidationError
    with pytest.raises(ValidationError) as exc_info:
        OrderIn(
            customerName="   ",
            table="Mesa 1",
            items=[OrderItem(productName="Hamburguesa", quantity=1, unitPrice=10000)]
        )
    assert "customerName must not be empty" in str(exc_info.value)

def test_create_order_with_valid_customer_name_with_spaces(order_service):
    """Test que valida que se pueden crear órdenes con nombres que tienen espacios al inicio/final"""
    order_in = OrderIn(
        customerName="  Juan Pérez  ",
        table="Mesa 1",
        items=[OrderItem(productName="Hamburguesa", quantity=1, unitPrice=10000)]
    )
    # Debe recortar los espacios automáticamente
    assert order_in.customerName == "Juan Pérez"
    order = order_service.create_order(order_in)
    assert order.customerName == "Juan Pérez"
