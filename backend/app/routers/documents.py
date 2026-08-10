import uuid
from datetime import date, datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.document import DocumentRead, DocumentUpdate, DocumentFolderRead
from app.schemas.document import DocumentCreate
from app.schemas.document_assignment import DocumentAssignmentCreate
from app.services.document_service import DocumentService
from app.services.document_workflow_service import DocumentWorkflowService

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("", response_model=list[DocumentRead], summary="Listar documentos")
def list_documents(
    search: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    uploaded_by: str | None = Query(default=None),
    current_responsible: str | None = Query(default=None),
    folder_id: uuid.UUID | None = Query(default=None),
    created_from: datetime | None = Query(default=None),
    created_to: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return DocumentService(db).list_documents(
        search=search,
        status=status_filter,
        uploaded_by=uploaded_by,
        current_responsible=current_responsible,
        folder_id=folder_id,
        created_from=created_from,
        created_to=created_to,
    )

@router.get("/folder", response_model=list[DocumentFolderRead], summary="Obtener carpetas")
def get_folder(
    parent_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return DocumentService(db).list_folders(parent_id=parent_id)

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
    assigned_to_id: uuid.UUID | None = Form(default=None),
    assignment_message: str | None = Form(default=None),
    assignment_due_date: date | None = Form(default=None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payload = DocumentCreate(
        title=title,
        description=description,
        current_responsible_id=current_responsible_id,
    )
    assignment_payload = None
    if submission_mode == "derive":
        if assigned_to_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debes seleccionar un responsable para derivar el documento",
            )
        assignment_payload = DocumentAssignmentCreate(
            document_id=uuid.uuid4(),
            assigned_to_id=assigned_to_id,
            message=assignment_message,
            due_date=assignment_due_date,
        )
    try:
        return DocumentWorkflowService(db).create_with_file(
            payload=payload,
            uploaded_by_id=current_user.id,
            file=file,
            submission_mode=submission_mode,
            assignment_payload=assignment_payload,
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
