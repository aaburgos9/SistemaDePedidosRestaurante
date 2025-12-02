from abc import ABC, abstractmethod
from typing import List, Optional
from app.models.order import OrderMessage

class OrderRepository(ABC):
    @abstractmethod
    def add(self, order: OrderMessage) -> None:
        pass

    @abstractmethod
    def get(self, order_id: str) -> Optional[OrderMessage]:
        pass

    @abstractmethod
    def update(self, order_id: str, order: OrderMessage) -> None:
        pass

    @abstractmethod
    def list(self) -> List[OrderMessage]:
        pass

class InMemoryOrderRepository(OrderRepository):
    def __init__(self):
        self._orders = {}

    def add(self, order: OrderMessage) -> None:
        self._orders[order.id] = order

    def get(self, order_id: str) -> Optional[OrderMessage]:
        return self._orders.get(order_id)

    def update(self, order_id: str, order: OrderMessage) -> None:
        if order_id in self._orders:
            self._orders[order_id] = order
        else:
            raise KeyError(f"Order {order_id} not found")

    def list(self) -> List[OrderMessage]:
        return list(self._orders.values())
