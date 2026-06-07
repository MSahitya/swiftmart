from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartSummary
from app.schemas.common import APIResponse
from app.services.cart_service import CartService
from app.api.v1.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=APIResponse[CartSummary])
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = CartService(db)
    return APIResponse.ok(data=service.get_cart(current_user.id))


@router.post("/items", response_model=APIResponse, status_code=201)
def add_to_cart(data: CartItemAdd, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = CartService(db)
    service.add_item(current_user.id, data.product_id, data.quantity)
    return APIResponse.ok(message="Item added to cart")


@router.put("/items/{item_id}", response_model=APIResponse)
def update_cart_item(item_id: UUID, data: CartItemUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = CartService(db)
    service.update_item(current_user.id, item_id, data.quantity)
    return APIResponse.ok(message="Cart updated")


@router.delete("/items/{item_id}", response_model=APIResponse)
def remove_cart_item(item_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = CartService(db)
    service.remove_item(current_user.id, item_id)
    return APIResponse.ok(message="Item removed from cart")


@router.delete("", response_model=APIResponse)
def clear_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = CartService(db)
    service.clear_cart(current_user.id)
    return APIResponse.ok(message="Cart cleared")
