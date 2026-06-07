from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator
from typing import List, Optional
from decouple import config as decouple_config


class Settings(BaseSettings):
    # App
    APP_NAME: str = "SwiftMart"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    SECRET_KEY: str = decouple_config("SECRET_KEY", default="changeme-32chars-minimum-secret!")
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Database
    DATABASE_URL: str = decouple_config(
        "DATABASE_URL",
        default="postgresql://swiftmart:swiftmart_pass@localhost:5432/swiftmart_db",
    )
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # Redis
    REDIS_URL: str = decouple_config("REDIS_URL", default="redis://localhost:6379/0")

    # JWT
    JWT_SECRET_KEY: str = decouple_config("JWT_SECRET_KEY", default="jwt-secret-changeme")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AWS S3
    AWS_ACCESS_KEY_ID: Optional[str] = decouple_config("AWS_ACCESS_KEY_ID", default=None)
    AWS_SECRET_ACCESS_KEY: Optional[str] = decouple_config("AWS_SECRET_ACCESS_KEY", default=None)
    AWS_REGION: str = decouple_config("AWS_REGION", default="us-east-1")
    S3_BUCKET_NAME: str = decouple_config("S3_BUCKET_NAME", default="swiftmart-images")
    S3_ENDPOINT_URL: Optional[str] = decouple_config("S3_ENDPOINT_URL", default=None)

    # Email
    SMTP_HOST: str = decouple_config("SMTP_HOST", default="smtp.gmail.com")
    SMTP_PORT: int = decouple_config("SMTP_PORT", default=587, cast=int)
    SMTP_USER: Optional[str] = decouple_config("SMTP_USER", default=None)
    SMTP_PASSWORD: Optional[str] = decouple_config("SMTP_PASSWORD", default=None)
    FROM_EMAIL: str = decouple_config("FROM_EMAIL", default="noreply@swiftmart.com")

    # Celery
    CELERY_BROKER_URL: str = decouple_config("CELERY_BROKER_URL", default="redis://localhost:6379/1")
    CELERY_RESULT_BACKEND: str = decouple_config("CELERY_RESULT_BACKEND", default="redis://localhost:6379/2")

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Cache TTL (seconds)
    CACHE_TTL_PRODUCTS: int = 600
    CACHE_TTL_CATEGORIES: int = 600

    # Admin seed
    FIRST_ADMIN_EMAIL: str = decouple_config("FIRST_ADMIN_EMAIL", default="admin@swiftmart.com")
    FIRST_ADMIN_PASSWORD: str = decouple_config("FIRST_ADMIN_PASSWORD", default="Admin@123456")

    @validator("ALLOWED_ORIGINS", pre=True)
    def parse_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
