from datetime import datetime
from typing import List
import bleach

from pydantic import BaseModel, conint, confloat, field_validator


class OrderItem(BaseModel):
    productName: str
    quantity: conint(gt=0)        # cantidad > 0
    unitPrice: confloat(ge=0)     # precio >= 0
    note: str = ""                # nota opcional, default vacío

    @field_validator("productName", "note")
    @classmethod
    def sanitize_text_fields(cls, v: str) -> str:
        """Sanitizar campos de texto para prevenir XSS"""
        if not v:
            return v
        # Permitir solo texto plano, eliminar HTML/JS
        sanitized = bleach.clean(v, tags=[], attributes={}, strip=True)
        # Limitar longitud
        if len(sanitized) > 500:
            raise ValueError("Text field too long (max 500 characters)")
        return sanitized.strip()


class OrderIn(BaseModel):
    customerName: str
    table: str
    items: List[OrderItem]

    @field_validator("customerName", "table")
    @classmethod
    def sanitize_and_validate_required_fields(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field must not be empty")
        # Sanitizar para prevenir XSS
        sanitized = bleach.clean(v, tags=[], attributes={}, strip=True)
        if len(sanitized) > 100:
            raise ValueError("Field too long (max 100 characters)")
        return sanitized.strip()

    @field_validator("items")
    @classmethod
    def items_must_not_be_empty(cls, v: List[OrderItem]) -> List[OrderItem]:
        if not v:
            raise ValueError("items must not be empty")
        return v



from typing import Literal

class OrderMessage(OrderIn):
    id: str
    createdAt: datetime
    status: Literal["pendiente", "preparando", "listo"] = "pendiente"
