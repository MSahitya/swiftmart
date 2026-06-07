from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User, UserRole


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id, User.is_deleted == False).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email, User.is_deleted == False).first()

    def create(self, name: str, email: str, password_hash: str, phone: Optional[str] = None, role: UserRole = UserRole.customer) -> User:
        user = User(name=name, email=email, password_hash=password_hash, phone=phone, role=role)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User, **kwargs) -> User:
        for key, value in kwargs.items():
            if value is not None:
                setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def soft_delete(self, user: User) -> None:
        user.is_deleted = True
        user.is_active = False
        self.db.commit()

    def list_all(self, page: int = 1, limit: int = 20, role: Optional[str] = None) -> Tuple[List[User], int]:
        query = self.db.query(User).filter(User.is_deleted == False)
        if role:
            query = query.filter(User.role == role)
        total = query.count()
        users = query.offset((page - 1) * limit).limit(limit).all()
        return users, total

    def count(self) -> int:
        return self.db.query(func.count(User.id)).filter(User.is_deleted == False).scalar()
