from __future__ import annotations

import io
from datetime import datetime, timezone

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.constants import DocumentConstants
from app.models.document_assignment import DocumentAssignment
from app.models.document_event import DocumentEvent
from app.models.related_document import RelatedDocument
from app.schemas.document import DocumentCreate
from app.schemas.document_assignment import DocumentAssignmentCreate, DocumentAssignmentDerive
from app.services.document_folder_service import DocumentFolderService
from app.services.document_assignment_service import DocumentAssignmentService
from app.services.document_drive_storage_service import DocumentDriveStorageService
from app.services.document_file_storage_service import DocumentFileStorageService
from app.services.document_service import DocumentService
from app.services.pending_notification_manager import pending_notification_manager


class DocumentWorkflowService:
    def __init__(self, db: Session, storage_service=None):
        self.db = db
        self.storage_service = storage_service or self._resolve_storage_service()
        self.document_service = DocumentService(db)
        self.folder_service = DocumentFolderService(db)
        self.assignment_service = DocumentAssignmentService(db)

    def _resolve_storage_service(self):
        if settings.GOOGLE_DRIVE_STORAGE_MODE.lower() == "drive":
            return DocumentDriveStorageService()
        return DocumentFileStorageService()

    def create_with_file(
        self,
        *,
        payload: DocumentCreate,
        uploaded_by_id,
        file: UploadFile,
        submission_mode: str,
        assignment_payload: DocumentAssignmentCreate | None = None,
        extra_files: list[UploadFile] = [],
    ):
        uploaded_refs = []
        stored_file = self.storage_service.store(file, title=payload.title)

        storage_ref = (
            getattr(stored_file, "storage_ref", None)
            or getattr(stored_file, "file_id", None)
            or stored_file.web_view_link
        )
        uploaded_refs.append(storage_ref)

        try:
            document_payload = payload.model_copy(
                update={
                    "drive_file_id": stored_file.file_id,
                    "drive_file_name": stored_file.file_name,
                    "drive_web_view_link": stored_file.web_view_link,
                    "drive_folder_id": getattr(stored_file, "folder_id", None),
                    "drive_folder_path": getattr(stored_file, "folder_path", None),
                    "mime_type": stored_file.mime_type,
                    "file_size": stored_file.file_size,
                }
            )

            folder = self.folder_service.resolve_path(
                getattr(stored_file, "folder_path", None),
                getattr(stored_file, "folder_id", None),
            )

            if folder is not None:
                document_payload = document_payload.model_copy(
                    update={"folder_id": folder.id}
                )

            status = (
                DocumentConstants.DOCUMENT_STATUS_ARCHIVED
                if submission_mode == "archive"
                else DocumentConstants.DOCUMENT_STATUS_REGISTERED
            )

            document = self.document_service.create(
                document_payload,
                uploaded_by_id,
                status=status,
                commit=False,
            )

            # Fuerza el INSERT y obtiene document.id
            self.db.flush()

            # Evento inicial de registro
            uploaded_event = DocumentEvent(
                document_id=document.id,
                user_id=uploaded_by_id,
                action="UPLOADED",
                previous_status=None,
                new_status=status,
                comment="Carga inicial del documento",
            )
            self.db.add(uploaded_event)

            # Si se archiva directamente, registrar evento de archivado
            if submission_mode == "archive":
                archived_event = DocumentEvent(
                    document_id=document.id,
                    user_id=uploaded_by_id,
                    action="ARCHIVED",
                    previous_status=DocumentConstants.DOCUMENT_STATUS_REGISTERED,
                    new_status=DocumentConstants.DOCUMENT_STATUS_ARCHIVED,
                    comment="Archivado directamente al registrar",
                )
                self.db.add(archived_event)

            # Procesar archivos adicionales / relacionados
            for extra_file in extra_files:
                stored_extra = self.storage_service.store(extra_file, title=extra_file.filename)
                extra_ref = (
                    getattr(stored_extra, "storage_ref", None)
                    or getattr(stored_extra, "file_id", None)
                    or stored_extra.web_view_link
                )
                uploaded_refs.append(extra_ref)

                child_payload = DocumentCreate(
                    title=extra_file.filename,
                    description="Adjunto subido en el registro inicial",
                    current_responsible_id=document.current_responsible_id,
                )

                child_doc = self.document_service.create(
                    payload=child_payload,
                    uploaded_by_id=uploaded_by_id,
                    status=status,
                    commit=False,
                )

                child_doc.drive_file_id = stored_extra.file_id
                child_doc.drive_file_name = stored_extra.file_name
                child_doc.drive_web_view_link = stored_extra.web_view_link
                child_doc.drive_folder_id = getattr(stored_extra, "folder_id", None)
                child_doc.drive_folder_path = getattr(stored_extra, "folder_path", None)
                child_doc.mime_type = stored_extra.mime_type
                child_doc.file_size = stored_extra.file_size
                child_doc.folder_id = document.folder_id

                self.db.flush()

                # Crear relación
                rel = RelatedDocument(
                    parent_document_id=document.id,
                    related_document_id=child_doc.id,
                    relation_type="attachment",
                    created_by_id=uploaded_by_id,
                )
                self.db.add(rel)

                # Evento inicial del adjunto
                child_event = DocumentEvent(
                    document_id=child_doc.id,
                    user_id=uploaded_by_id,
                    action="UPLOADED",
                    previous_status=None,
                    new_status=status,
                    comment="Registrado como documento relacionado",
                )
                self.db.add(child_event)

                # Evento en el historial del padre
                parent_event = DocumentEvent(
                    document_id=document.id,
                    user_id=uploaded_by_id,
                    action="RELATED_DOCUMENT_ADDED",
                    previous_status=status,
                    new_status=status,
                    comment=f"Se adjuntó documento relacionado (Anexo): {extra_file.filename}",
                )
                self.db.add(parent_event)

                if submission_mode == "archive":
                    child_archived_event = DocumentEvent(
                        document_id=child_doc.id,
                        user_id=uploaded_by_id,
                        action="ARCHIVED",
                        previous_status=DocumentConstants.DOCUMENT_STATUS_REGISTERED,
                        new_status=DocumentConstants.DOCUMENT_STATUS_ARCHIVED,
                        comment="Archivado directamente al registrar",
                    )
                    self.db.add(child_archived_event)

            assignment = None
            if assignment_payload is not None:
                assignment_payload = assignment_payload.model_copy(
                    update={"document_id": document.id}
                )

                assignment = self.assignment_service.create(
                    assignment_payload,
                    assigned_by_id=uploaded_by_id,
                    commit=False,
                )

            self.db.flush()
            self.db.commit()

            if assignment is not None:
                self.assignment_service.notify_created(assignment.assigned_to_id, assignment.id, document.id)

            return document

        except Exception:
            self.db.rollback()
            for ref in uploaded_refs:
                try:
                    self.storage_service.remove(ref)
                except Exception:
                    pass
            raise

    def archive_assignment(
        self,
        assignment: DocumentAssignment,
        user_id,
        comment: str | None = None,
    ) -> DocumentAssignment:
        """Finaliza la asignacion y archiva el documento en una sola transaccion."""
        document = self.assignment_service._ensure_document(assignment.document_id)

        previous_status = document.status
        previous_responsible_id = document.current_responsible_id

        assignment.status = "RESOLVED"
        assignment.resolved_at = datetime.now(timezone.utc)

        document.status = DocumentConstants.DOCUMENT_STATUS_ARCHIVED
        document.current_responsible_id = None

        event = DocumentEvent(
            document_id=assignment.document_id,
            user_id=user_id,
            action="ARCHIVED",
            previous_status=previous_status,
            new_status=DocumentConstants.DOCUMENT_STATUS_ARCHIVED,
            previous_responsible_id=previous_responsible_id,
            new_responsible_id=None,
            comment=comment,
        )
        self.db.add(event)

        # Archivar también todos los documentos relacionados
        related_links = self.db.query(RelatedDocument).filter(
            RelatedDocument.parent_document_id == document.id
        ).all()

        for link in related_links:
            child = link.related_document
            if child and child.status != DocumentConstants.DOCUMENT_STATUS_ARCHIVED:
                prev_child_status = child.status
                prev_child_resp = child.current_responsible_id
                
                child.status = DocumentConstants.DOCUMENT_STATUS_ARCHIVED
                child.current_responsible_id = None
                
                child_event = DocumentEvent(
                    document_id=child.id,
                    user_id=user_id,
                    action="ARCHIVED",
                    previous_status=prev_child_status,
                    new_status=DocumentConstants.DOCUMENT_STATUS_ARCHIVED,
                    previous_responsible_id=prev_child_resp,
                    new_responsible_id=None,
                    comment="Archivado automáticamente al archivar documento principal",
                )
                self.db.add(child_event)

        self.db.commit()
        self.db.refresh(assignment)
        return assignment

    def derive_assignment(
        self,
        assignment: DocumentAssignment,
        user_id,
        payload: DocumentAssignmentDerive,
    ) -> DocumentAssignment:
        """Resuelve la asignacion actual y crea una nueva derivacion en una sola transaccion."""
        document = self.assignment_service._ensure_document(assignment.document_id)
        self.assignment_service._ensure_user(payload.assigned_to_id)

        previous_responsible_id = document.current_responsible_id
        previous_status = document.status

        # Resolver asignacion actual
        assignment.status = "RESOLVED"
        assignment.resolved_at = datetime.now(timezone.utc)

        # Actualizar responsable del documento
        document.current_responsible_id = payload.assigned_to_id
        document.status = DocumentConstants.DOCUMENT_STATUS_DERIVED

        # Nueva asignacion
        new_assignment = DocumentAssignment(
            document_id=assignment.document_id,
            assigned_by_id=user_id,
            assigned_to_id=payload.assigned_to_id,
            message=payload.message,
            due_date=payload.due_date,
            status="PENDING",
        )

        event = DocumentEvent(
            document_id=assignment.document_id,
            user_id=user_id,
            action="DERIVED",
            previous_status=previous_status,
            new_status=DocumentConstants.DOCUMENT_STATUS_DERIVED,
            previous_responsible_id=previous_responsible_id,
            new_responsible_id=payload.assigned_to_id,
            comment=payload.message,
            metadata_={
                "due_date": payload.due_date.isoformat() if payload.due_date else None,
            },
        )

        self.db.add(new_assignment)
        self.db.add(event)
        self.db.flush()
        self.db.commit()
        self.db.refresh(new_assignment)

        # Notificar al nuevo responsable via WebSocket
        pending_notification_manager.notify_user_nowait(
            str(payload.assigned_to_id),
            {
                "type": "document_assignment_created",
                "assignment_id": str(new_assignment.id),
                "document_id": str(assignment.document_id),
            },
        )

        return new_assignment

    def download_file(self, document) -> tuple[io.BytesIO, str, str]:
        """Descarga el archivo fisico del documento desde el almacenamiento configurado."""
        if settings.GOOGLE_DRIVE_STORAGE_MODE.lower() == "drive":
            file_stream = self.storage_service.download(document.drive_file_id)
        else:
            file_stream = self.storage_service.download(document.drive_file_name)
        return file_stream, document.drive_file_name, document.mime_type

    def add_related_document(
        self,
        *,
        parent_id: uuid.UUID,
        file: UploadFile,
        title: str,
        description: str | None,
        relation_type: str,
        user_id: uuid.UUID,
    ) -> Document:
        """Sube un archivo relacionado y lo asocia transaccionalmente al documento padre."""
        parent_doc = self.document_service.get_by_id(parent_id)
        if not parent_doc:
            raise ValueError("El documento principal no existe")

        stored_file = self.storage_service.store(file, title=title)
        storage_ref = (
            getattr(stored_file, "storage_ref", None)
            or getattr(stored_file, "file_id", None)
            or stored_file.web_view_link
        )

        try:
            child_payload = DocumentCreate(
                title=title,
                description=description,
                current_responsible_id=parent_doc.current_responsible_id,
            )

            # status: se hereda el mismo estado del padre para consistencia en filtros y vistas
            child_doc = self.document_service.create(
                payload=child_payload,
                uploaded_by_id=user_id,
                status=parent_doc.status,
                commit=False,
            )

            child_doc.drive_file_id = stored_file.file_id
            child_doc.drive_file_name = stored_file.file_name
            child_doc.drive_web_view_link = stored_file.web_view_link
            child_doc.drive_folder_id = getattr(stored_file, "folder_id", None)
            child_doc.drive_folder_path = getattr(stored_file, "folder_path", None)
            child_doc.mime_type = stored_file.mime_type
            child_doc.file_size = stored_file.file_size
            child_doc.folder_id = parent_doc.folder_id

            self.db.flush()

            rel = RelatedDocument(
                parent_document_id=parent_id,
                related_document_id=child_doc.id,
                relation_type=relation_type,
                created_by_id=user_id,
            )

            # Evento inicial del adjunto
            child_event = DocumentEvent(
                document_id=child_doc.id,
                user_id=user_id,
                action="UPLOADED",
                previous_status=None,
                new_status=parent_doc.status,
                comment=f"Registrado como documento relacionado ({relation_type})",
            )

            # Evento en el historial del padre
            parent_event = DocumentEvent(
                document_id=parent_id,
                user_id=user_id,
                action="RELATED_DOCUMENT_ADDED",
                previous_status=parent_doc.status,
                new_status=parent_doc.status,
                comment=f"Se adjuntó documento relacionado ({relation_type}): {title}",
            )

            self.db.add(rel)
            self.db.add(child_event)
            self.db.add(parent_event)
            self.db.commit()
            return child_doc
        except Exception:
            self.db.rollback()
            try:
                self.storage_service.remove(storage_ref)
            except Exception:
                pass
            raise
