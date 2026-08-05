import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.document import DocumentRead, DocumentUpdate, DocumentFolderRead
from app.schemas.document import DocumentCreate
from app.services.document_service import DocumentService
from app.services.document_workflow_service import DocumentWorkflowService

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("", response_model=list[DocumentRead], summary="Listar documentos")
def list_documents(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return DocumentService(db).list_documents()


@router.get("/{document_id}", response_model=DocumentRead, summary="Obtener documento")
def get_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    document = DocumentService(db).get_by_id(document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado")
    return document



@router.post("", response_model=DocumentRead, status_code=status.HTTP_201_CREATED, summary="Crear documento")
def create_document(
    title: str = Form(...),
    description: str | None = Form(default=None),
    current_responsible_id: uuid.UUID | None = Form(default=None),
    submission_mode: str = Form(default="register"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payload = DocumentCreate(
        title=title,
        description=description,
        current_responsible_id=current_responsible_id,
    )
    try:
        return DocumentWorkflowService(db).create_with_file(
            payload=payload,
            uploaded_by_id=current_user.id,
            file=file,
            submission_mode=submission_mode,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.put("/{document_id}", response_model=DocumentRead, summary="Actualizar documento")
def update_document(
    document_id: uuid.UUID,
    payload: DocumentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    service = DocumentService(db)
    document = service.get_by_id(document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado")
    try:
        return service.update(document, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/{document_id}/delete-logical", response_model=DocumentRead, summary="Eliminar lógicamente")
def delete_logical_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    service = DocumentService(db)
    document = service.get_by_id(document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado")
    return service.logical_delete(document)
