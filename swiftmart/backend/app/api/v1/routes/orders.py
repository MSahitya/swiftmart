from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import math

from app.core.database import get_db
from app.schemas.order import OrderCreate, OrderOut
from app.schemas.common import APIResponse, PaginatedResponse
from app.services.order_service import OrderService
from app.api.v1.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=APIResponse[OrderOut], status_code=201)
def create_order(data: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = OrderService(db)
    order = service.create_from_cart(current_user.id, data)
    return APIResponse.ok(data=_serialize_order(order), message="Order placed successfully")


@router.get("", response_model=PaginatedResponse[OrderOut])
def get_my_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = OrderService(db)
    orders, total = service.get_user_orders(current_user.id, page, limit)
    return PaginatedResponse(
        data=[_serialize_order(o) for o in orders],
        page=page, limit=limit, total_count=total,
        total_pages=math.ceil(total / limit),
    )


@router.get("/{order_id}", response_model=APIResponse[OrderOut])
def get_order(order_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = OrderService(db)
    order = service.get_user_order(current_user.id, order_id)
    return APIResponse.ok(data=_serialize_order(order))


def _serialize_order(order) -> dict:
    return OrderOut(
        id=order.id,
        total_amount=order.total_amount,
        delivery_fee=order.delivery_fee,
        status=order.status,
        delivery_address=order.delivery_address,
        payment_method=order.payment_method,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=[
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else "Unknown",
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "subtotal": item.subtotal,
            }
            for item in order.items
        ],
    )
