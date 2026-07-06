from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.models.user import User


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def authenticate(self, username: str, password: str) -> tuple[User, str] | None:
        user = self.db.query(User).filter(User.username == username).first()
        if user is None or not user.is_active:
            return None

        if not verify_password(password, user.password_hash):
            return None

        return user, create_access_token(str(user.id))
