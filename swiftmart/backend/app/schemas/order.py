from datetime import datetime
from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field


class DeliveryAddress(BaseModel):
    full_name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=10)
    address_line1: str = Field(..., min_length=5)
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str = Field(..., min_length=4)
    country: str = "India"


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., ge=1)


class OrderCreate(BaseModel):
    delivery_address: DeliveryAddress
    payment_method: str = "cash_on_delivery"
    notes: Optional[str] = None


class OrderItemOut(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: float

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: UUID
    total_amount: Decimal
    delivery_fee: Decimal
    status: str
    delivery_address: dict
    payment_method: str
    notes: Optional[str]
    items: List[OrderItemOut]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str
