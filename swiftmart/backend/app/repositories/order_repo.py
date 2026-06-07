from typing import List, Optional, Tuple
from uuid import UUID
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models.order import Order, OrderItem, OrderStatus


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, order_id: UUID) -> Optional[Order]:
        return (
            self.db.query(Order)
            .options(joinedload(Order.items).joinedload(OrderItem.product))
            .filter(Order.id == order_id)
            .first()
        )

    def get_user_orders(self, user_id: UUID, page: int = 1, limit: int = 10) -> Tuple[List[Order], int]:
        query = (
            self.db.query(Order)
            .options(joinedload(Order.items).joinedload(OrderItem.product))
            .filter(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
        )
        total = query.count()
        orders = query.offset((page - 1) * limit).limit(limit).all()
        return orders, total

    def list_all(self, page: int = 1, limit: int = 20, status: Optional[str] = None) -> Tuple[List[Order], int]:
        query = (
            self.db.query(Order)
            .options(joinedload(Order.items), joinedload(Order.user))
            .order_by(Order.created_at.desc())
        )
        if status:
            query = query.filter(Order.status == status)
        total = query.count()
        orders = query.offset((page - 1) * limit).limit(limit).all()
        return orders, total

    def create(self, user_id: UUID, total_amount: Decimal, delivery_fee: Decimal, delivery_address: dict, payment_method: str, notes: Optional[str] = None) -> Order:
        order = Order(
            user_id=user_id,
            total_amount=total_amount,
            delivery_fee=delivery_fee,
            delivery_address=delivery_address,
            payment_method=payment_method,
            notes=notes,
        )
        self.db.add(order)
        self.db.flush()
        return order

    def add_items(self, order: Order, items: List[dict]) -> None:
        for item in items:
            oi = OrderItem(
                order_id=order.id,
                product_id=item["product_id"],
                quantity=item["quantity"],
                unit_price=item["unit_price"],
            )
            self.db.add(oi)

    def update_status(self, order: Order, status: str) -> Order:
        order.status = status
        self.db.commit()
        self.db.refresh(order)
        return order

    def today_orders_count(self) -> int:
        from datetime import date, datetime, timezone
        today_start = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)
        return self.db.query(func.count(Order.id)).filter(Order.created_at >= today_start).scalar()

    def total_revenue(self) -> Decimal:
        result = self.db.query(func.sum(Order.total_amount)).filter(
            Order.status == OrderStatus.delivered
        ).scalar()
        return result or Decimal("0")

    def count(self) -> int:
        return self.db.query(func.count(Order.id)).scalar()
