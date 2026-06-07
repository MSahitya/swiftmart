import uuid
import enum
from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class OrderStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    out_for_delivery = "out_for_delivery"
    delivered = "delivered"
    cancelled = "cancelled"


class PaymentMethod(str, enum.Enum):
    cash_on_delivery = "cash_on_delivery"
    card = "card"
    upi = "upi"


class Order(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "orders"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    delivery_fee = Column(Numeric(10, 2), default=0, nullable=False)
    status = Column(SAEnum(OrderStatus), default=OrderStatus.pending, nullable=False, index=True)
    delivery_address = Column(JSONB, nullable=False)
    payment_method = Column(SAEnum(PaymentMethod), default=PaymentMethod.cash_on_delivery, nullable=False)
    notes = Column(String(500), nullable=True)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Order {self.id} - {self.status}>"


class OrderItem(Base, UUIDMixin):
    __tablename__ = "order_items"

    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

    @property
    def subtotal(self) -> float:
        return float(self.unit_price) * self.quantity
