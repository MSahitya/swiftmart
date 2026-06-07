from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user import UserRegister, UserLogin, TokenResponse, RefreshTokenRequest, UserUpdate, ChangePassword, UserOut
from app.schemas.common import APIResponse
from app.services.auth_service import AuthService
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.core.security import hash_password, verify_password
from fastapi import HTTPException

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=APIResponse[TokenResponse], status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    service = AuthService(db)
    user, access_token, refresh_token = service.register(data)
    return APIResponse.ok(
        data=TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserOut.model_validate(user),
        ),
        message="Registration successful",
    )


@router.post("/login", response_model=APIResponse[TokenResponse])
def login(data: UserLogin, db: Session = Depends(get_db)):
    service = AuthService(db)
    user, access_token, refresh_token = service.login(data)
    return APIResponse.ok(
        data=TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserOut.model_validate(user),
        ),
        message="Login successful",
    )


@router.post("/refresh", response_model=APIResponse[dict])
def refresh(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    access_token, refresh_token = service.refresh(data.refresh_token)
    return APIResponse.ok(
        data={"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"},
        message="Token refreshed",
    )


@router.post("/logout", response_model=APIResponse)
def logout(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    service.logout(data.refresh_token)
    return APIResponse.ok(message="Logged out successfully")


@router.get("/me", response_model=APIResponse[UserOut])
def get_me(current_user: User = Depends(get_current_user)):
    return APIResponse.ok(data=UserOut.model_validate(current_user))


@router.put("/me", response_model=APIResponse[UserOut])
def update_me(data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = UserRepository(db)
    updated = repo.update(current_user, **{k: v for k, v in data.model_dump().items() if v is not None})
    return APIResponse.ok(data=UserOut.model_validate(updated), message="Profile updated")


@router.post("/change-password", response_model=APIResponse)
def change_password(data: ChangePassword, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    repo = UserRepository(db)
    repo.update(current_user, password_hash=hash_password(data.new_password))
    return APIResponse.ok(message="Password changed successfully")
