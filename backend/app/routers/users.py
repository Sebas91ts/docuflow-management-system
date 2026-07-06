import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.routers.deps import require_admin
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get(
    "",
    response_model=list[UserRead],
    summary="Listar usuarios",
    description="Devuelve todos los usuarios del sistema. Solo disponible para administradores.",
)
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return UserService(db).list_users()


@router.post(
    "",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear usuario",
    description="Crea un usuario interno del sistema. No es un registro publico; solo administradores pueden usarlo.",
)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    service = UserService(db)
    if service.get_by_username(payload.username) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El nombre de usuario ya existe",
        )

    return service.create_user(payload)


@router.put(
    "/{user_id}",
    response_model=UserRead,
    summary="Actualizar usuario",
    description="Actualiza datos, rol, estado o contrasena de un usuario. Solo administradores.",
)
def update_user(
    user_id: uuid.UUID,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    service = UserService(db)
    user = service.get_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    if payload.username is not None:
        existing_user = service.get_by_username(payload.username)
        if existing_user is not None and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El nombre de usuario ya existe",
            )

    return service.update_user(user, payload)


@router.patch(
    "/{user_id}/deactivate",
    response_model=UserRead,
    summary="Desactivar usuario",
    description="Desactiva un usuario para impedir su inicio de sesion. Solo administradores.",
)
def deactivate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    service = UserService(db)
    user = service.get_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    return service.deactivate_user(user)

# active user
@router.patch(
    "/{user_id}/activate",
    response_model=UserRead,
    summary="Activar usuario",
    description="Activa un usuario para permitir su inicio de sesion. Solo administradores.",
)
def activate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    service = UserService(db)
    user = service.get_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    return service.activate_user(user)