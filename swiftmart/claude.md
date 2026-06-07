# SwiftMart Project

## What This Project Is
Full-stack instant delivery e-commerce store.
Grocery, vegetables, fruits, snacks, apparel, electronics.

## Tech Stack
- Frontend: React 18 + Tailwind + Shadcn/ui + React Query
- Backend: FastAPI (Python 3.11)
- Database: PostgreSQL 15 with SQLAlchemy + Alembic
- Cache: Redis
- Auth: JWT + Refresh Tokens

## Folder Structure
/frontend/src/pages       → All page components
/frontend/src/components  → Reusable components
/backend/app/routes       → FastAPI route files
/backend/app/models       → SQLAlchemy models
/backend/app/services     → Business logic
/backend/app/repositories → Database queries

## Architecture Rules
- Always use Repository Pattern
- Never write SQL in routes
- All responses follow: {success, data, message, error}
- UUID primary keys everywhere
- Soft deletes only (is_deleted flag)

## Current Features Built
- User auth (register, login, JWT)
- Product listing with categories
- Shopping cart
- Checkout and orders
- Admin panel

## Pending Features
- Wishlist
- Product reviews
- Delivery tracking
- Push notifications