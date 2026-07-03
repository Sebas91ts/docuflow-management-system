from pydantic import BaseModel, ConfigDict

from app.core.constants import AuthConstants
from app.schemas.user import UserRead


class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = AuthConstants.TOKEN_TYPE


class AuthResponse(Token):
    user: UserRead


class TokenPayload(BaseModel):
    sub: str


class CurrentUser(UserRead):
    model_config = ConfigDict(from_attributes=True)
