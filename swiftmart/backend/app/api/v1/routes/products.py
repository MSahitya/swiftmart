from typing import Optional
from uuid import UUID
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.product import ProductOut, ProductListOut, CategoryOut
from app.schemas.common import APIResponse, PaginatedResponse
from app.services.product_service import ProductService, CategoryService
from app.utils.s3_upload import upload_image_to_s3
import math

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/categories", response_model=APIResponse[list])
def get_categories(db: Session = Depends(get_db)):
    service = CategoryService(db)
    return APIResponse.ok(data=service.get_all(active_only=True))


@router.get("", response_model=PaginatedResponse[ProductListOut])
def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[UUID] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    in_stock_only: bool = False,
    search: Optional[str] = None,
    sort_by: str = Query("created_at", pattern="^(created_at|price|name)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    service = ProductService(db)
    products, total = service.list_products(
        page=page, limit=limit, category_id=category_id,
        min_price=min_price, max_price=max_price,
        in_stock_only=in_stock_only, search=search,
        sort_by=sort_by, sort_order=sort_order,
    )
    return PaginatedResponse(
        data=[ProductListOut.model_validate(p) for p in products],
        page=page,
        limit=limit,
        total_count=total,
        total_pages=math.ceil(total / limit),
    )


@router.get("/{product_id}", response_model=APIResponse[ProductOut])
def get_product(product_id: UUID, db: Session = Depends(get_db)):
    service = ProductService(db)
    product = service.get_by_id(product_id)
    return APIResponse.ok(data=ProductOut.model_validate(product))


@router.get("/slug/{slug}", response_model=APIResponse[ProductOut])
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    service = ProductService(db)
    product = service.get_by_slug(slug)
    return APIResponse.ok(data=ProductOut.model_validate(product))
