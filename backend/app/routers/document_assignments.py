import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.document_assignment import (
    DocumentAssignmentArchive,
    DocumentAssignmentCreate,
    DocumentAssignmentDerive,
    DocumentAssignmentRead,
    DocumentAssignmentResolve,
)
from app.services.document_assignment_service import DocumentAssignmentService
from app.services.document_workflow_service import DocumentWorkflowService
from app.services.pending_notification_manager import pending_notification_manager

router = APIRouter(prefix="/api/document-assignments", tags=["document-assignments"])


@router.get("/document/{document_id}", response_model=list[DocumentAssignmentRead], summary="Listar derivaciones de un documento")
def list_document_assignments(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return DocumentAssignmentService(db).list_by_document(document_id)


@router.get("/pending", response_model=list[DocumentAssignmentRead], summary="Listar pendientes del usuario")
def list_pending_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return DocumentAssignmentService(db).list_pending_for_user(current_user.id)


@router.post("", response_model=DocumentAssignmentRead, status_code=status.HTTP_201_CREATED, summary="Derivar documento")
def create_document_assignment(
    payload: DocumentAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return DocumentAssignmentService(db).create(payload, assigned_by_id=current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/{assignment_id}/resolve", response_model=DocumentAssignmentRead, summary="Resolver derivacion")
def resolve_document_assignment(
    assignment_id: uuid.UUID,
    payload: DocumentAssignmentResolve,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    service = DocumentAssignmentService(db)
    assignment = service.get_by_id(assignment_id)
    if assignment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Derivacion no encontrada")
    try:
        return service.resolve(assignment, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/{assignment_id}/attend", response_model=DocumentAssignmentRead, summary="Marcar en atencion")
def attend_assignment(
    assignment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DocumentAssignmentService(db)
    assignment = service.get_by_id(assignment_id)
    if assignment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Derivacion no encontrada")
    if assignment.assigned_to_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para esta accion")
    if assignment.status not in ("PENDING", "IN_PROGRESS"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La asignacion ya fue resuelta")
    try:
        return service.mark_in_progress(assignment, current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/{assignment_id}/archive", response_model=DocumentAssignmentRead, summary="Finalizar y archivar documento")
def archive_assignment(
    assignment_id: uuid.UUID,
    payload: DocumentAssignmentArchive,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DocumentAssignmentService(db)
    assignment = service.get_by_id(assignment_id)
    if assignment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Derivacion no encontrada")
    if assignment.assigned_to_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para esta accion")
    if assignment.status not in ("PENDING", "IN_PROGRESS"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La asignacion ya fue resuelta")
    try:
        return DocumentWorkflowService(db).archive_assignment(assignment, current_user.id, payload.comment)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/{assignment_id}/derive", response_model=DocumentAssignmentRead, summary="Derivar a otro usuario")
def derive_to_other(
    assignment_id: uuid.UUID,
    payload: DocumentAssignmentDerive,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DocumentAssignmentService(db)
    assignment = service.get_by_id(assignment_id)
    if assignment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Derivacion no encontrada")
    if assignment.assigned_to_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para esta accion")
    if assignment.status not in ("PENDING", "IN_PROGRESS"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La asignacion ya fue resuelta")
    if str(payload.assigned_to_id) == str(current_user.id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes derivarte el documento a ti mismo")
    try:
        return DocumentWorkflowService(db).derive_assignment(assignment, current_user.id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.websocket("/ws/pending")
async def pending_assignments_ws(
    websocket: WebSocket,
    token: str = Query(...),
):
    from app.core.security import decode_access_token
    from app.db.database import SessionLocal
    from app.models.user import User

    user_id = decode_access_token(token)
    if user_id is None:
        await websocket.close(code=1008)
        return

    db = SessionLocal()
    parsed_user_id = None
    try:
        parsed_user_id = uuid.UUID(user_id)
        user = db.query(User).filter(User.id == parsed_user_id, User.is_active.is_(True)).first()
        if user is None:
            await websocket.close(code=1008)
            return

        await pending_notification_manager.connect(str(user.id), websocket)

        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        if parsed_user_id is not None:
            await pending_notification_manager.disconnect(str(parsed_user_id), websocket)
        db.close()


@router.get("/document/{document_id}", response_model=list[DocumentAssignmentRead], summary="Listar derivaciones de un documento")
def list_document_assignments(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return DocumentAssignmentService(db).list_by_document(document_id)


@router.get("/pending", response_model=list[DocumentAssignmentRead], summary="Listar pendientes del usuario")
def list_pending_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return DocumentAssignmentService(db).list_pending_for_user(current_user.id)
