from datetime import datetime
from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field


class CategoryOut(BaseModel):
    id: UUID
    name: str
    slug: str
    image_url: Optional[str]
    display_order: int
    is_active: bool

    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=120)
    image_url: Optional[str] = None
    parent_id: Optional[UUID] = None
    display_order: int = 0


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=2, max_length=300)
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    discount_price: Optional[Decimal] = Field(None, gt=0)
    stock_qty: int = Field(..., ge=0)
    category_id: UUID
    images: List[str] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    discount_price: Optional[Decimal] = None
    stock_qty: Optional[int] = Field(None, ge=0)
    category_id: Optional[UUID] = None
    images: Optional[List[str]] = None
    is_active: Optional[bool] = None


class ProductOut(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    price: Decimal
    discount_price: Optional[Decimal]
    stock_qty: int
    images: List[str]
    is_active: bool
    in_stock: bool
    effective_price: float
    category: CategoryOut
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductListOut(BaseModel):
    id: UUID
    name: str
    slug: str
    price: Decimal
    discount_price: Optional[Decimal]
    images: List[str]
    stock_qty: int
    in_stock: bool
    effective_price: float
    category_id: UUID

    model_config = {"from_attributes": True}
