import os
import uuid
from datetime import datetime, timezone

from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


def create_admin():
    username = os.getenv("BOOTSTRAP_ADMIN_USERNAME")
    password = os.getenv("BOOTSTRAP_ADMIN_PASSWORD")

    if not username:
        raise RuntimeError(
            "Falta la variable BOOTSTRAP_ADMIN_USERNAME"
        )

    if not password:
        raise RuntimeError(
            "Falta la variable BOOTSTRAP_ADMIN_PASSWORD"
        )

    db = SessionLocal()

    try:
        existing_user = (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

        if existing_user:
            print(f"El usuario '{username}' ya existe.")
            return

        admin = User(
            id=uuid.uuid4(),
            full_name="Administrador",
            username=username,
            password_hash=hash_password(password),
            role="admin",
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

        db.add(admin)
        db.commit()

        print("===================================")
        print("ADMINISTRADOR CREADO CORRECTAMENTE")
        print("===================================")
        print(f"Usuario: {username}")
        print("Rol: admin")
        print("Activo: True")

    except Exception as e:
        db.rollback()
        raise RuntimeError(
            f"No se pudo crear el administrador: {e}"
        ) from e

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()