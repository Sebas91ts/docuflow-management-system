from __future__ import annotations

import io
from datetime import datetime, timezone

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.constants import DocumentConstants
from app.models.document_assignment import DocumentAssignment
from app.models.document_event import DocumentEvent
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
    ):
        stored_file = self.storage_service.store(file, title=payload.title)

        storage_ref = (
            getattr(stored_file, "storage_ref", None)
            or getattr(stored_file, "file_id", None)
            or stored_file.web_view_link
        )

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

            try:
                self.storage_service.remove(storage_ref)
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
