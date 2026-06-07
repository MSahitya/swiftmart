"""
Run once to seed the first admin user and sample categories/products.
Usage:  python init_db.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.product import Product


CATEGORIES = [
    {"name": "Fruits & Vegetables", "slug": "fruits-vegetables", "display_order": 1},
    {"name": "Dairy & Eggs", "slug": "dairy-eggs", "display_order": 2},
    {"name": "Snacks", "slug": "snacks", "display_order": 3},
    {"name": "Beverages", "slug": "beverages", "display_order": 4},
    {"name": "Bakery", "slug": "bakery", "display_order": 5},
    {"name": "Personal Care", "slug": "personal-care", "display_order": 6},
    {"name": "Household", "slug": "household", "display_order": 7},
    {"name": "Frozen Foods", "slug": "frozen-foods", "display_order": 8},
]


def seed():
    db = SessionLocal()
    try:
        # Admin user
        admin = db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first()
        if not admin:
            admin = User(
                name="Admin",
                email=settings.FIRST_ADMIN_EMAIL,
                password_hash=hash_password(settings.FIRST_ADMIN_PASSWORD),
                role=UserRole.admin,
            )
            db.add(admin)
            db.commit()
            print(f"✓ Admin created: {settings.FIRST_ADMIN_EMAIL}")
        else:
            print(f"  Admin already exists: {settings.FIRST_ADMIN_EMAIL}")

        # Categories
        created_cats = {}
        for cat_data in CATEGORIES:
            cat = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not cat:
                cat = Category(**cat_data)
                db.add(cat)
                db.commit()
                db.refresh(cat)
                print(f"✓ Category: {cat.name}")
            created_cats[cat_data["slug"]] = cat.id

        # Sample products
        sample_products = [
            {"name": "Fresh Bananas (Dozen)", "slug": "fresh-bananas-dozen", "price": "49.00", "stock_qty": 100, "category_slug": "fruits-vegetables"},
            {"name": "Whole Milk 1L", "slug": "whole-milk-1l", "price": "62.00", "discount_price": "58.00", "stock_qty": 50, "category_slug": "dairy-eggs"},
            {"name": "Lays Classic Salted 40g", "slug": "lays-classic-salted-40g", "price": "20.00", "stock_qty": 200, "category_slug": "snacks"},
            {"name": "Coca-Cola 500ml", "slug": "coca-cola-500ml", "price": "45.00", "stock_qty": 150, "category_slug": "beverages"},
            {"name": "Brown Bread 400g", "slug": "brown-bread-400g", "price": "42.00", "discount_price": "38.00", "stock_qty": 30, "category_slug": "bakery"},
        ]

        for p_data in sample_products:
            cat_slug = p_data.pop("category_slug")
            if db.query(Product).filter(Product.slug == p_data["slug"]).first():
                continue
            cat_id = created_cats.get(cat_slug)
            if cat_id:
                product = Product(**p_data, category_id=cat_id)
                db.add(product)
                print(f"✓ Product: {p_data['name']}")
        db.commit()

        print("\n✅ Database seeded successfully!")
        print(f"   Admin login: {settings.FIRST_ADMIN_EMAIL} / {settings.FIRST_ADMIN_PASSWORD}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
