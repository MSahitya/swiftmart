from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: str = "OK"
    error: Optional[str] = None

    @classmethod
    def ok(cls, data: Any = None, message: str = "OK"):
        return cls(success=True, data=data, message=message, error=None)

    @classmethod
    def fail(cls, message: str, error: str = None):
        return cls(success=False, data=None, message=message, error=error)


class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    data: List[T] = []
    message: str = "OK"
    error: Optional[str] = None
    page: int = 1
    limit: int = 20
    total_count: int = 0
    total_pages: int = 0
