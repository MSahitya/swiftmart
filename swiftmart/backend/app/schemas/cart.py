from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field


class CartItemAdd(BaseModel):
    product_id: UUID
    quantity: int = Field(..., ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=0)


class CartItemOut(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str
    product_image: Optional[str]
    unit_price: Decimal
    quantity: int
    subtotal: float

    model_config = {"from_attributes": True}


class CartSummary(BaseModel):
    items: List[CartItemOut]
    subtotal: float
    delivery_fee: float
    total: float
    item_count: int
