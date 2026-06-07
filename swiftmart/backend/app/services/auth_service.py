from datetime import datetime, timedelta, timezone
from typing import Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
)
from app.core.config import settings
from app.models.user import User, UserRole
from app.repositories.user_repo import UserRepository
from app.repositories.token_repo import TokenRepository
from app.schemas.user import UserRegister, UserLogin


class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)
        self.token_repo = TokenRepository(db)

    def register(self, data: UserRegister) -> Tuple[User, str, str]:
        if self.user_repo.get_by_email(data.email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        user = self.user_repo.create(
            name=data.name,
            email=data.email,
            password_hash=hash_password(data.password),
            phone=data.phone,
        )
        access_token = create_access_token({"sub": str(user.id), "role": user.role})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        self.token_repo.create(user.id, refresh_token, expires_at)
        return user, access_token, refresh_token

    def login(self, data: UserLogin) -> Tuple[User, str, str]:
        user = self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
        expire_days = settings.REFRESH_TOKEN_EXPIRE_DAYS * 2 if data.remember_me else settings.REFRESH_TOKEN_EXPIRE_DAYS
        access_token = create_access_token({"sub": str(user.id), "role": user.role})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        expires_at = datetime.now(timezone.utc) + timedelta(days=expire_days)
        self.token_repo.create(user.id, refresh_token, expires_at)
        return user, access_token, refresh_token

    def refresh(self, token: str) -> Tuple[str, str]:
        payload = decode_token(token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        rt = self.token_repo.get_by_token(token)
        if not rt or not rt.is_valid:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or revoked")
        user = self.user_repo.get_by_id(UUID(payload["sub"]))
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        self.token_repo.revoke(rt)
        new_access = create_access_token({"sub": str(user.id), "role": user.role})
        new_refresh = create_refresh_token({"sub": str(user.id)})
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        self.token_repo.create(user.id, new_refresh, expires_at)
        return new_access, new_refresh

    def logout(self, token: str) -> None:
        rt = self.token_repo.get_by_token(token)
        if rt:
            self.token_repo.revoke(rt)
