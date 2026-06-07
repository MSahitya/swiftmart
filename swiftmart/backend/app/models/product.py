import uuid
from sqlalchemy import Column, String, Boolean, Integer, Numeric, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Product(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "products"

    name = Column(String(255), nullable=False)
    slug = Column(String(300), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    discount_price = Column(Numeric(10, 2), nullable=True)
    stock_qty = Column(Integer, default=0, nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False, index=True)
    images = Column(ARRAY(String), default=list, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)

    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")

    @property
    def effective_price(self) -> float:
        return float(self.discount_price if self.discount_price else self.price)

    @property
    def in_stock(self) -> bool:
        return self.stock_qty > 0

    def __repr__(self) -> str:
        return f"<Product {self.name}>"
