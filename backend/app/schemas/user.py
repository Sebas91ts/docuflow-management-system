import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import UserRole


class UserBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)
    username: str = Field(min_length=3, max_length=80)
    role: UserRole = UserRole.USER
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=150)
    username: str | None = Field(default=None, min_length=3, max_length=80)
    role: UserRole | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
