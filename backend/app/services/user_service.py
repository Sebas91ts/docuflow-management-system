import uuid

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def list_users(self) -> list[User]:
        return self.db.query(User).order_by(User.created_at.desc()).all()

    def get_by_id(self, user_id: uuid.UUID) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_username(self, username: str) -> User | None:
        return self.db.query(User).filter(User.username == username).first()

    def create_user(self, payload: UserCreate) -> User:
        user = User(
            full_name=payload.full_name,
            username=payload.username,
            password_hash=hash_password(payload.password),
            role=payload.role.value,
            is_active=payload.is_active,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_user(self, user: User, payload: UserUpdate) -> User:
        update_data = payload.model_dump(exclude_unset=True)
        password = update_data.pop("password", None)

        role = update_data.pop("role", None)
        if role is not None:
            user.role = role.value

        for field, value in update_data.items():
            setattr(user, field, value)

        if password is not None:
            user.password_hash = hash_password(password)

        self.db.commit()
        self.db.refresh(user)
        return user

    def deactivate_user(self, user: User) -> User:
        user.is_active = False
        self.db.commit()
        self.db.refresh(user)
        return user
