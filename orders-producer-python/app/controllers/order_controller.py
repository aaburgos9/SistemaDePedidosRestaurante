from fastapi import APIRouter, HTTPException
from app.models.order import OrderIn, OrderMessage
from app.services.order_service import OrderService
from app.repositories.order_repository import InMemoryOrderRepository

router = APIRouter(
    prefix="/api/v1/orders",
    tags=["orders"],
)

# Instancia única del repositorio y servicio (singleton simple para este contexto)
order_repository = InMemoryOrderRepository()
order_service = OrderService(order_repository)

@router.post("/", response_model=OrderMessage, status_code=201)
def create_order_endpoint(order_in: OrderIn):
    return order_service.create_order(order_in)

@router.get("/{order_id}", response_model=OrderMessage)
def get_order_endpoint(order_id: str):
    order = order_service.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}", response_model=OrderMessage)
def update_order_endpoint(order_id: str, order_in: OrderIn):
    try:
        return order_service.update_order(order_id, order_in)
    except ValueError:
        raise HTTPException(status_code=404, detail="Order not found")
    except PermissionError:
        raise HTTPException(status_code=409, detail="No se puede editar una orden en preparación")