from typing import Optional, List, Tuple
from uuid import UUID
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_

from app.models.product import Product
from app.models.category import Category


class CategoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, category_id: UUID) -> Optional[Category]:
        return self.db.query(Category).filter(Category.id == category_id).first()

    def get_by_slug(self, slug: str) -> Optional[Category]:
        return self.db.query(Category).filter(Category.slug == slug).first()

    def list_active(self) -> List[Category]:
        return (
            self.db.query(Category)
            .filter(Category.is_active == True)
            .order_by(Category.display_order)
            .all()
        )

    def list_all(self) -> List[Category]:
        return self.db.query(Category).order_by(Category.display_order).all()

    def create(self, **kwargs) -> Category:
        cat = Category(**kwargs)
        self.db.add(cat)
        self.db.commit()
        self.db.refresh(cat)
        return cat

    def update(self, category: Category, **kwargs) -> Category:
        for k, v in kwargs.items():
            if v is not None:
                setattr(category, k, v)
        self.db.commit()
        self.db.refresh(category)
        return category

    def delete(self, category: Category) -> None:
        self.db.delete(category)
        self.db.commit()


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, product_id: UUID) -> Optional[Product]:
        return (
            self.db.query(Product)
            .options(joinedload(Product.category))
            .filter(Product.id == product_id, Product.is_deleted == False)
            .first()
        )

    def get_by_slug(self, slug: str) -> Optional[Product]:
        return (
            self.db.query(Product)
            .options(joinedload(Product.category))
            .filter(Product.slug == slug, Product.is_deleted == False)
            .first()
        )

    def list_products(
        self,
        page: int = 1,
        limit: int = 20,
        category_id: Optional[UUID] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
        in_stock_only: bool = False,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> Tuple[List[Product], int]:
        query = (
            self.db.query(Product)
            .options(joinedload(Product.category))
            .filter(Product.is_deleted == False, Product.is_active == True)
        )
        if category_id:
            query = query.filter(Product.category_id == category_id)
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        if in_stock_only:
            query = query.filter(Product.stock_qty > 0)
        if search:
            pattern = f"%{search}%"
            query = query.filter(
                or_(Product.name.ilike(pattern), Product.description.ilike(pattern))
            )
        sort_col = getattr(Product, sort_by, Product.created_at)
        query = query.order_by(sort_col.desc() if sort_order == "desc" else sort_col.asc())
        total = query.count()
        products = query.offset((page - 1) * limit).limit(limit).all()
        return products, total

    def create(self, **kwargs) -> Product:
        product = Product(**kwargs)
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update(self, product: Product, **kwargs) -> Product:
        for k, v in kwargs.items():
            setattr(product, k, v)
        self.db.commit()
        self.db.refresh(product)
        return product

    def soft_delete(self, product: Product) -> None:
        product.is_deleted = True
        self.db.commit()

    def decrement_stock(self, product_id: UUID, quantity: int) -> bool:
        product = self.db.query(Product).filter(Product.id == product_id).with_for_update().first()
        if not product or product.stock_qty < quantity:
            return False
        product.stock_qty -= quantity
        self.db.commit()
        return True

    def low_stock(self, threshold: int = 10) -> List[Product]:
        return (
            self.db.query(Product)
            .filter(Product.is_deleted == False, Product.stock_qty <= threshold)
            .all()
        )

    def count(self) -> int:
        return self.db.query(func.count(Product.id)).filter(Product.is_deleted == False).scalar()
