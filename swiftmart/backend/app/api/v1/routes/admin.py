from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import math

from app.core.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut, CategoryCreate, CategoryUpdate, CategoryOut
from app.schemas.order import OrderStatusUpdate, OrderOut
from app.schemas.user import UserOut
from app.schemas.common import APIResponse, PaginatedResponse
from app.services.product_service import ProductService, CategoryService
from app.services.order_service import OrderService
from app.repositories.user_repo import UserRepository
from app.api.v1.dependencies import get_current_admin
from app.models.user import User
from app.utils.s3_upload import upload_image_to_s3
from app.api.v1.routes.orders import _serialize_order

router = APIRouter(prefix="/admin", tags=["Admin"])


# Dashboard
@router.get("/dashboard", response_model=APIResponse[dict])
def dashboard(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    service = OrderService(db)
    user_repo = UserRepository(db)
    product_service = ProductService(db)
    stats = service.get_dashboard_stats()
    stats["total_users"] = user_repo.count()
    stats["total_products"] = product_service.repo.count()
    return APIResponse.ok(data=stats)


# Categories
@router.get("/categories", response_model=APIResponse[list])
def list_categories(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    service = CategoryService(db)
    return APIResponse.ok(data=service.get_all(active_only=False))


@router.post("/categories", response_model=APIResponse[CategoryOut], status_code=201)
def create_category(data: CategoryCreate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    service = CategoryService(db)
    cat = service.create(data)
    return APIResponse.ok(data=CategoryOut.model_validate(cat), message="Category created")


@router.put("/categories/{category_id}", response_model=APIResponse[CategoryOut])
def update_category(category_id: UUID, data: CategoryUpdate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    service = CategoryService(db)
    cat = service.update(category_id, data)
    return APIResponse.ok(data=CategoryOut.model_validate(cat), message="Category updated")


@router.delete("/categories/{category_id}", response_model=APIResponse)
def delete_category(category_id: UUID, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    service = CategoryService(db)
    service.delete(category_id)
    return APIResponse.ok(message="Category deleted")


# Products
@router.get("/products", response_model=PaginatedResponse[ProductOut])
def list_products_admin(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[UUID] = None,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    service = ProductService(db)
    products, total = service.list_products(page=page, limit=limit, search=search, category_id=category_id)
    return PaginatedResponse(
        data=[ProductOut.model_validate(p) for p in products],
        page=page, limit=limit, total_count=total,
        total_pages=math.ceil(total / limit),
    )


@router.post("/products", response_model=APIResponse[ProductOut], status_code=201)
def create_product(data: ProductCreate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    service = ProductService(db)
    product = service.create(data)
    return APIResponse.ok(data=ProductOut.model_validate(product), message="Product created")


@router.put("/products/{product_id}", response_model=APIResponse[ProductOut])
def update_product(product_id: UUID, data: ProductUpdate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    service = ProductService(db)
    product = service.update(product_id, data)
    return APIResponse.ok(data=ProductOut.model_validate(product), message="Product updated")


@router.delete("/products/{product_id}", response_model=APIResponse)
def delete_product(product_id: UUID, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    service = ProductService(db)
    service.delete(product_id)
    return APIResponse.ok(message="Product deleted")


@router.post("/products/{product_id}/upload-image", response_model=APIResponse[dict])
async def upload_product_image(
    product_id: UUID,
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    image_url = await upload_image_to_s3(file, f"products/{product_id}")
    service = ProductService(db)
    service.upload_image(product_id, image_url)
    return APIResponse.ok(data={"image_url": image_url}, message="Image uploaded")


# Orders
@router.get("/orders", response_model=PaginatedResponse[OrderOut])
def list_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    service = OrderService(db)
    orders, total = service.admin_list_orders(page, limit, status)
    return PaginatedResponse(
        data=[_serialize_order(o) for o in orders],
        page=page, limit=limit, total_count=total,
        total_pages=math.ceil(total / limit),
    )


@router.put("/orders/{order_id}/status", response_model=APIResponse[OrderOut])
def update_order_status(order_id: UUID, data: OrderStatusUpdate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    service = OrderService(db)
    order = service.update_status(order_id, data.status)
    return APIResponse.ok(data=_serialize_order(order), message="Order status updated")


# Users
@router.get("/users", response_model=PaginatedResponse[UserOut])
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    repo = UserRepository(db)
    users, total = repo.list_all(page, limit)
    return PaginatedResponse(
        data=[UserOut.model_validate(u) for u in users],
        page=page, limit=limit, total_count=total,
        total_pages=math.ceil(total / limit),
    )


@router.get("/low-stock", response_model=APIResponse[list])
def low_stock_products(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    service = ProductService(db)
    products = service.get_low_stock()
    return APIResponse.ok(data=[{"id": str(p.id), "name": p.name, "stock_qty": p.stock_qty} for p in products])
