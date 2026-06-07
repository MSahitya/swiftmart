# SwiftMart — Instant Grocery & Lifestyle Delivery

A production-ready full-stack e-commerce platform built with FastAPI + React 18.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · Tailwind CSS · TanStack Query · React Router v6 |
| Backend | FastAPI · Python 3.11 · Uvicorn · Gunicorn |
| Database | PostgreSQL 15 · SQLAlchemy 2.0 · Alembic |
| Cache | Redis 7 |
| Auth | JWT (python-jose) · bcrypt |
| Task Queue | Celery + Redis |
| File Storage | AWS S3 / Cloudflare R2 |
| Proxy | Nginx |
| Containers | Docker + Docker Compose |

---

## Quick Start (Docker Compose — Recommended)

### 1. Clone and configure

```bash
git clone https://github.com/you/swiftmart.git
cd swiftmart

# Copy and edit backend config
cp backend/.env.example backend/.env
# Edit backend/.env — set SECRET_KEY, JWT_SECRET_KEY, S3 credentials, etc.

# Copy frontend config
cp frontend/.env.example frontend/.env
```

### 2. Launch all services

```bash
docker compose up --build
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **Backend API** on port 8000
- **Frontend** on port 3000
- **Nginx** reverse proxy on port 80

### 3. Run database migrations + seed

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python init_db.py
```

### 4. Access the app

| Service | URL |
|---------|-----|
| Customer site | http://localhost |
| API docs | http://localhost/api/docs |
| Admin panel | http://localhost/admin |
| Direct backend | http://localhost:8000/api/docs |

**Default admin credentials:**
- Email: `admin@swiftmart.com`
- Password: `Admin@123456`

---

## Local Development (Without Docker)

### Backend

**Requirements:** Python 3.11+, PostgreSQL 15, Redis 7

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your local DB/Redis credentials

# Run migrations
alembic upgrade head

# Seed database
python init_db.py

# Start dev server
uvicorn main:app --reload --port 8000
```

API available at: http://localhost:8000
Swagger docs: http://localhost:8000/api/docs

### Frontend

**Requirements:** Node.js 20+

```bash
cd frontend

# Install dependencies
npm install

# Configure API base URL
cp .env.example .env.local
# VITE_API_BASE_URL=http://localhost:8000

# Start dev server
npm run dev
```

Frontend available at: http://localhost:5173

### Celery Worker (for background tasks)

```bash
cd backend
celery -A app.tasks.celery_app worker --loglevel=info
```

---

## Project Structure

```
swiftmart/
├── backend/
│   ├── app/
│   │   ├── api/v1/routes/      # FastAPI routers (auth, products, cart, orders, admin)
│   │   ├── core/               # Config, database, security, Redis client
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic v2 request/response schemas
│   │   ├── services/           # Business logic layer
│   │   ├── repositories/       # Database query layer
│   │   ├── middleware/         # Request logging, security headers
│   │   ├── tasks/              # Celery background tasks
│   │   └── utils/              # S3 upload, slugify helpers
│   ├── alembic/                # Database migrations
│   ├── main.py                 # FastAPI application entry point
│   ├── init_db.py              # Database seeder
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, ProductCard, CartItem, ...)
│   │   ├── pages/              # Route-level pages (Home, Products, Cart, ...)
│   │   ├── pages/admin/        # Admin panel pages
│   │   ├── services/           # Axios API service functions
│   │   ├── store/              # Zustand auth store + React Query client
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── constants/          # App-wide constants
│   │   └── utils/              # formatPrice, cn, debounce helpers
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── nginx/
│   ├── nginx.conf              # Development reverse proxy
│   └── nginx.prod.conf         # Production with SSL
├── docker-compose.yml          # Local full-stack setup
├── docker-compose.prod.yml     # Production deployment
└── README.md
```

---

## API Reference

All endpoints follow the pattern: `GET /api/v1/<resource>`

### Response format

```json
{
  "success": true,
  "data": {},
  "message": "OK",
  "error": null
}
```

### Key endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | — | Register new user |
| POST | `/api/v1/auth/login` | — | Login, get JWT tokens |
| POST | `/api/v1/auth/refresh` | — | Refresh access token |
| GET | `/api/v1/products` | — | List products (paginated) |
| GET | `/api/v1/products/{id}` | — | Get product details |
| GET | `/api/v1/cart` | ✓ | Get cart |
| POST | `/api/v1/cart/items` | ✓ | Add item to cart |
| POST | `/api/v1/orders` | ✓ | Place order from cart |
| GET | `/api/v1/orders` | ✓ | List user orders |
| GET | `/api/v1/admin/dashboard` | Admin | Dashboard stats |
| POST | `/api/v1/admin/products` | Admin | Create product |

Full docs: http://localhost:8000/api/docs

---

## Database Schema

```
users           → id, name, email, password_hash, role, phone, is_active, is_deleted
categories      → id, name, slug, image_url, parent_id, display_order
products        → id, name, slug, description, price, discount_price, stock_qty, category_id, images[]
orders          → id, user_id, total_amount, delivery_fee, status, delivery_address (jsonb), payment_method
order_items     → id, order_id, product_id, quantity, unit_price
cart            → id, user_id, product_id, quantity
refresh_tokens  → id, user_id, token_hash, expires_at, is_revoked
```

---

## Production Deployment

### 1. Provision a server (Ubuntu 22.04 recommended)

```bash
# Install Docker
curl -fsSL https://get.docker.com | bash
sudo usermod -aG docker $USER

# Clone repo
git clone https://github.com/you/swiftmart.git
cd swiftmart
```

### 2. Configure production env

```bash
cp backend/.env.example backend/.env.production
# Set strong SECRET_KEY, JWT_SECRET_KEY, real DB credentials, S3 keys
```

### 3. Get SSL certificate (Let's Encrypt)

```bash
# Update nginx.prod.conf with your domain
# Run certbot
docker run -it --rm \
  -v ./nginx/ssl:/etc/letsencrypt \
  -v ./certbot_www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot -d yourdomain.com
```

### 4. Launch production stack

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
docker compose -f docker-compose.prod.yml exec backend python init_db.py
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | App secret (min 32 chars) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET_KEY` | JWT signing secret |
| `AWS_ACCESS_KEY_ID` | S3/R2 access key |
| `AWS_SECRET_ACCESS_KEY` | S3/R2 secret key |
| `S3_BUCKET_NAME` | Image storage bucket |
| `S3_ENDPOINT_URL` | Custom endpoint for R2 (optional) |
| `SMTP_HOST` | SMTP host for emails |
| `FIRST_ADMIN_EMAIL` | Seeded admin email |
| `FIRST_ADMIN_PASSWORD` | Seeded admin password |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL |

---

## Running Tests

```bash
cd backend
pytest tests/ -v --cov=app
```

---

## Security Features

- Passwords hashed with bcrypt (never stored plain)
- JWT access tokens (15 min) + refresh tokens (7 days, rotated)
- Rate limiting on all API endpoints (slowapi)
- CORS restricted to configured origins
- SQL injection protection via SQLAlchemy ORM
- Pydantic v2 input validation on every endpoint
- Security headers on all responses (HSTS, X-Frame-Options, CSP)
- HTTPS enforced in production (Nginx)
- XSS protection on frontend inputs (React, Zod)
- Soft deletes — data never permanently removed
