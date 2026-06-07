from typing import List
from uuid import UUID
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories.cart_repo import CartRepository
from app.repositories.product_repo import ProductRepository
from app.schemas.cart import CartSummary, CartItemOut

DELIVERY_FEE = Decimal("49.00")
FREE_DELIVERY_THRESHOLD = Decimal("499.00")


class CartService:
    def __init__(self, db: Session):
        self.cart_repo = CartRepository(db)
        self.product_repo = ProductRepository(db)

    def get_cart(self, user_id: UUID) -> CartSummary:
        items = self.cart_repo.get_user_cart(user_id)
        item_outs = []
        subtotal = Decimal("0")
        for item in items:
            product = item.product
            if not product or product.is_deleted:
                continue
            unit_price = product.discount_price or product.price
            line_total = unit_price * item.quantity
            subtotal += line_total
            item_outs.append(
                CartItemOut(
                    id=item.id,
                    product_id=product.id,
                    product_name=product.name,
                    product_image=product.images[0] if product.images else None,
                    unit_price=unit_price,
                    quantity=item.quantity,
                    subtotal=float(line_total),
                )
            )
        delivery_fee = Decimal("0") if subtotal >= FREE_DELIVERY_THRESHOLD else DELIVERY_FEE
        return CartSummary(
            items=item_outs,
            subtotal=float(subtotal),
            delivery_fee=float(delivery_fee),
            total=float(subtotal + delivery_fee),
            item_count=sum(i.quantity for i in item_outs),
        )

    def add_item(self, user_id: UUID, product_id: UUID, quantity: int):
        product = self.product_repo.get_by_id(product_id)
        if not product or not product.is_active:
            raise HTTPException(status_code=404, detail="Product not found")
        if product.stock_qty < quantity:
            raise HTTPException(status_code=400, detail=f"Only {product.stock_qty} items in stock")
        return self.cart_repo.add_item(user_id, product_id, quantity)

    def update_item(self, user_id: UUID, item_id: UUID, quantity: int):
        item = self.cart_repo.get_item_by_id(item_id, user_id)
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        if quantity == 0:
            self.cart_repo.remove_item(item)
            return None
        product = self.product_repo.get_by_id(item.product_id)
        if product and product.stock_qty < quantity:
            raise HTTPException(status_code=400, detail=f"Only {product.stock_qty} items available")
        return self.cart_repo.update_quantity(item, quantity)

    def remove_item(self, user_id: UUID, item_id: UUID):
        item = self.cart_repo.get_item_by_id(item_id, user_id)
        if not item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        self.cart_repo.remove_item(item)

    def clear_cart(self, user_id: UUID):
        self.cart_repo.clear_cart(user_id)
