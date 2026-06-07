from decimal import Decimal
from typing import List, Tuple, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories.order_repo import OrderRepository
from app.repositories.product_repo import ProductRepository
from app.repositories.cart_repo import CartRepository
from app.schemas.order import OrderCreate
from app.models.order import Order, OrderStatus
from app.services.cart_service import DELIVERY_FEE, FREE_DELIVERY_THRESHOLD


class OrderService:
    def __init__(self, db: Session):
        self.order_repo = OrderRepository(db)
        self.product_repo = ProductRepository(db)
        self.cart_repo = CartRepository(db)

    def create_from_cart(self, user_id: UUID, data: OrderCreate) -> Order:
        cart_items = self.cart_repo.get_user_cart(user_id)
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        order_items = []
        subtotal = Decimal("0")
        for item in cart_items:
            product = self.product_repo.get_by_id(item.product_id)
            if not product or not product.is_active:
                raise HTTPException(status_code=400, detail=f"Product {item.product_id} is no longer available")
            if product.stock_qty < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
            unit_price = product.discount_price or product.price
            order_items.append({
                "product_id": product.id,
                "quantity": item.quantity,
                "unit_price": unit_price,
            })
            subtotal += unit_price * item.quantity

        delivery_fee = Decimal("0") if subtotal >= FREE_DELIVERY_THRESHOLD else DELIVERY_FEE
        total = subtotal + delivery_fee

        order = self.order_repo.create(
            user_id=user_id,
            total_amount=total,
            delivery_fee=delivery_fee,
            delivery_address=data.delivery_address.model_dump(),
            payment_method=data.payment_method,
            notes=data.notes,
        )
        self.order_repo.add_items(order, order_items)

        # Decrement stock
        for item in order_items:
            success = self.product_repo.decrement_stock(item["product_id"], item["quantity"])
            if not success:
                raise HTTPException(status_code=400, detail="Stock update failed. Please try again.")

        # Clear cart
        self.cart_repo.clear_cart(user_id)
        self.order_repo.db.commit()
        self.order_repo.db.refresh(order)

        # Trigger notification task
        from app.tasks.email_tasks import send_order_confirmation
        send_order_confirmation.delay(str(order.id))

        return order

    def get_user_order(self, user_id: UUID, order_id: UUID) -> Order:
        order = self.order_repo.get_by_id(order_id)
        if not order or order.user_id != user_id:
            raise HTTPException(status_code=404, detail="Order not found")
        return order

    def get_user_orders(self, user_id: UUID, page: int = 1, limit: int = 10) -> Tuple[List[Order], int]:
        return self.order_repo.get_user_orders(user_id, page, limit)

    def update_status(self, order_id: UUID, new_status: str) -> Order:
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        valid = [s.value for s in OrderStatus]
        if new_status not in valid:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid}")
        return self.order_repo.update_status(order, new_status)

    def admin_list_orders(self, page: int = 1, limit: int = 20, status: Optional[str] = None) -> Tuple[List[Order], int]:
        return self.order_repo.list_all(page, limit, status)

    def get_dashboard_stats(self) -> dict:
        return {
            "total_orders": self.order_repo.count(),
            "orders_today": self.order_repo.today_orders_count(),
            "total_revenue": float(self.order_repo.total_revenue()),
            "total_users": 0,
            "low_stock_products": len(self.product_repo.low_stock()),
        }
