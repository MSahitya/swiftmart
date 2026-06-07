import json
from typing import List, Optional, Tuple
from uuid import UUID
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.product_repo import ProductRepository, CategoryRepository
from app.schemas.product import ProductCreate, ProductUpdate, CategoryCreate, CategoryUpdate
from app.core.redis_client import cache_get, cache_set, cache_delete_pattern
from app.core.config import settings
from app.utils.slugify import slugify


CACHE_KEY_CATEGORIES = "categories:all"
CACHE_KEY_PRODUCTS = "products:list:{page}:{limit}:{cat}:{search}:{sort}"


class CategoryService:
    def __init__(self, db: Session):
        self.repo = CategoryRepository(db)

    def get_all(self, active_only: bool = True):
        cached = cache_get(CACHE_KEY_CATEGORIES)
        if cached:
            return cached
        cats = self.repo.list_active() if active_only else self.repo.list_all()
        result = [
            {"id": str(c.id), "name": c.name, "slug": c.slug, "image_url": c.image_url, "display_order": c.display_order, "is_active": c.is_active}
            for c in cats
        ]
        cache_set(CACHE_KEY_CATEGORIES, result, settings.CACHE_TTL_CATEGORIES)
        return result

    def create(self, data: CategoryCreate):
        if self.repo.get_by_slug(data.slug):
            raise HTTPException(status_code=400, detail="Category slug already exists")
        return self.repo.create(**data.model_dump())

    def update(self, category_id: UUID, data: CategoryUpdate):
        cat = self.repo.get_by_id(category_id)
        if not cat:
            raise HTTPException(status_code=404, detail="Category not found")
        updated = self.repo.update(cat, **{k: v for k, v in data.model_dump().items() if v is not None})
        cache_delete_pattern("categories:*")
        return updated

    def delete(self, category_id: UUID):
        cat = self.repo.get_by_id(category_id)
        if not cat:
            raise HTTPException(status_code=404, detail="Category not found")
        self.repo.delete(cat)
        cache_delete_pattern("categories:*")


class ProductService:
    def __init__(self, db: Session):
        self.repo = ProductRepository(db)
        self.cat_repo = CategoryRepository(db)

    def get_by_id(self, product_id: UUID):
        product = self.repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

    def get_by_slug(self, slug: str):
        product = self.repo.get_by_slug(slug)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

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
    ) -> Tuple[list, int]:
        return self.repo.list_products(
            page=page, limit=limit, category_id=category_id,
            min_price=min_price, max_price=max_price,
            in_stock_only=in_stock_only, search=search,
            sort_by=sort_by, sort_order=sort_order,
        )

    def create(self, data: ProductCreate):
        if not self.cat_repo.get_by_id(data.category_id):
            raise HTTPException(status_code=404, detail="Category not found")
        if self.repo.get_by_slug(data.slug):
            raise HTTPException(status_code=400, detail="Product slug already exists")
        product = self.repo.create(**data.model_dump())
        cache_delete_pattern("products:*")
        return product

    def update(self, product_id: UUID, data: ProductUpdate):
        product = self.get_by_id(product_id)
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        updated = self.repo.update(product, **update_data)
        cache_delete_pattern("products:*")
        return updated

    def delete(self, product_id: UUID):
        product = self.get_by_id(product_id)
        self.repo.soft_delete(product)
        cache_delete_pattern("products:*")

    def upload_image(self, product_id: UUID, image_url: str):
        product = self.get_by_id(product_id)
        images = list(product.images or [])
        images.append(image_url)
        return self.repo.update(product, images=images)

    def get_low_stock(self, threshold: int = 10):
        return self.repo.low_stock(threshold)
