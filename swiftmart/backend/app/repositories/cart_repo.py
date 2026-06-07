from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session, joinedload

from app.models.cart import CartItem


class CartRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_item(self, user_id: UUID, product_id: UUID) -> Optional[CartItem]:
        return self.db.query(CartItem).filter(
            CartItem.user_id == user_id, CartItem.product_id == product_id
        ).first()

    def get_item_by_id(self, item_id: UUID, user_id: UUID) -> Optional[CartItem]:
        return self.db.query(CartItem).filter(
            CartItem.id == item_id, CartItem.user_id == user_id
        ).first()

    def get_user_cart(self, user_id: UUID) -> List[CartItem]:
        return (
            self.db.query(CartItem)
            .options(joinedload(CartItem.product))
            .filter(CartItem.user_id == user_id)
            .all()
        )

    def add_item(self, user_id: UUID, product_id: UUID, quantity: int) -> CartItem:
        existing = self.get_item(user_id, product_id)
        if existing:
            existing.quantity += quantity
            self.db.commit()
            self.db.refresh(existing)
            return existing
        item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update_quantity(self, item: CartItem, quantity: int) -> CartItem:
        item.quantity = quantity
        self.db.commit()
        self.db.refresh(item)
        return item

    def remove_item(self, item: CartItem) -> None:
        self.db.delete(item)
        self.db.commit()

    def clear_cart(self, user_id: UUID) -> None:
        self.db.query(CartItem).filter(CartItem.user_id == user_id).delete()
        self.db.commit()
