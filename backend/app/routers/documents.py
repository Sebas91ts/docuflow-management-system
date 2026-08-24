import uuid
from datetime import date, datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.document import DocumentRead, DocumentUpdate, DocumentFolderRead, DocumentEventRead, RelatedDocumentRead
from app.schemas.document import DocumentCreate
from app.schemas.document_assignment import DocumentAssignmentCreate
from app.services.document_service import DocumentService
from app.services.document_workflow_service import DocumentWorkflowService
from app.models.document_event import DocumentEvent
from app.models.related_document import RelatedDocument

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
    limit: int | None = Query(default=10),
    offset: int | None = Query(default=None),
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
        limit=limit,
        offset=offset,
    )

@router.get("/folder", response_model=list[DocumentFolderRead], summary="Obtener carpetas")
def get_folder(
    parent_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return DocumentService(db).list_folders(parent_id=parent_id)

@router.get("/dashboard/stats", summary="Estadísticas para el dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.document import Document
    from app.models.document_assignment import DocumentAssignment
    from app.core.constants import DocumentConstants

    total_docs = db.query(Document).filter(Document.deleted_at.is_(None)).count()
    pending_count = db.query(DocumentAssignment).filter(
        DocumentAssignment.assigned_to_id == current_user.id,
        DocumentAssignment.status == "PENDING"
    ).count()
    in_progress_count = db.query(DocumentAssignment).filter(
        DocumentAssignment.assigned_to_id == current_user.id,
        DocumentAssignment.status == "IN_PROGRESS"
    ).count()
    archived_count = db.query(Document).filter(
        Document.status == DocumentConstants.DOCUMENT_STATUS_ARCHIVED,
        Document.deleted_at.is_(None)
    ).count()

    recent_documents = db.query(Document).filter(
        Document.deleted_at.is_(None)
    ).order_by(Document.created_at.desc()).limit(5).all()

    recent_docs_list = [
        {
            "id": str(d.id),
            "title": d.title,
            "code": d.code,
            "status": d.status,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in recent_documents
    ]

    return {
        "total_documents": total_docs,
        "pending_assignments": pending_count,
        "in_progress_assignments": in_progress_count,
        "archived_documents": archived_count,
        "recent_documents": recent_docs_list,
    }

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
    extra_files: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payload = DocumentCreate(
        title=title,
        description=description,
        current_responsible_id=current_responsible_id,
    )
    print("========== CREATE DOCUMENT ==========")
    print("submission_mode:", submission_mode)
    print("assigned_to_id:", assigned_to_id)
    print("assigned_to_id type:", type(assigned_to_id))
    print("assignment_message:", assignment_message)
    print("assignment_due_date:", assignment_due_date)
    print("====================================")
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
            extra_files=extra_files,
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


# Descargar documento
@router.get("/{document_id}/download", summary="Descargar documento")
def download_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    document = DocumentService(db).get_by_id(document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado")
    if not document.drive_file_id and not document.drive_file_name:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El documento no tiene un archivo físico asociado")
    try:
        file_stream, file_name, mime_type = DocumentWorkflowService(db).download_file(document)
        return StreamingResponse(
            file_stream,
            media_type=mime_type or "application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{file_name}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error al descargar: {str(exc)}")


@router.get("/{document_id}/timeline", response_model=list[DocumentEventRead], summary="Historial de trazabilidad del documento")
def get_document_timeline(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    document = DocumentService(db).get_by_id(document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado")
    events = (
        db.query(DocumentEvent)
        .filter(DocumentEvent.document_id == document_id)
        .order_by(DocumentEvent.created_at.asc())
        .all()
    )
    return events


@router.post("/{document_id}/related", response_model=DocumentRead, status_code=status.HTTP_201_CREATED, summary="Adjuntar documento relacionado")
def add_related_document(
    document_id: uuid.UUID,
    relation_type: str = Form(default="attachment"),
    title: str | None = Form(default=None),
    description: str | None = Form(default=None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        resolved_title = title or file.filename
        return DocumentWorkflowService(db).add_related_document(
            parent_id=document_id,
            file=file,
            title=resolved_title,
            description=description,
            relation_type=relation_type,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/{document_id}/related", response_model=list[RelatedDocumentRead], summary="Listar documentos relacionados")
def get_related_documents(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    relations = (
        db.query(RelatedDocument)
        .filter(RelatedDocument.parent_document_id == document_id)
        .order_by(RelatedDocument.created_at.asc())
        .all()
    )
    return relations
