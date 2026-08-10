import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.document_assignment import (
    DocumentAssignmentCreate,
    DocumentAssignmentRead,
    DocumentAssignmentResolve,
)
from app.services.document_assignment_service import DocumentAssignmentService

router = APIRouter(prefix="/api/document-assignments", tags=["document-assignments"])


@router.get("/document/{document_id}", response_model=list[DocumentAssignmentRead], summary="Listar derivaciones de un documento")
def list_document_assignments(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return DocumentAssignmentService(db).list_by_document(document_id)


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
