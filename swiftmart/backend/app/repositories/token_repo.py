from datetime import datetime, timezone
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.token import RefreshToken
from app.core.security import hash_token


class TokenRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: UUID, token: str, expires_at: datetime) -> RefreshToken:
        token_hash = hash_token(token)
        rt = RefreshToken(user_id=user_id, token_hash=token_hash, expires_at=expires_at)
        self.db.add(rt)
        self.db.commit()
        self.db.refresh(rt)
        return rt

    def get_by_token(self, token: str) -> Optional[RefreshToken]:
        token_hash = hash_token(token)
        return self.db.query(RefreshToken).filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.is_revoked == False,
        ).first()

    def revoke(self, refresh_token: RefreshToken) -> None:
        refresh_token.is_revoked = True
        self.db.commit()

    def revoke_all_for_user(self, user_id: UUID) -> None:
        self.db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.is_revoked == False,
        ).update({"is_revoked": True})
        self.db.commit()

    def cleanup_expired(self) -> int:
        count = self.db.query(RefreshToken).filter(
            RefreshToken.expires_at < datetime.now(timezone.utc)
        ).delete()
        self.db.commit()
        return count
