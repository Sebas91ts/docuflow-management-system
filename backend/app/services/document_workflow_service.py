from __future__ import annotations

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.constants import DocumentConstants
from app.schemas.document import DocumentCreate
from app.services.document_drive_storage_service import DocumentDriveStorageService
from app.services.document_file_storage_service import DocumentFileStorageService
from app.services.document_service import DocumentService


class DocumentWorkflowService:
    def __init__(self, db: Session, storage_service=None):
        self.db = db
        self.storage_service = storage_service or self._resolve_storage_service()
        self.document_service = DocumentService(db)

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
    ):
        stored_file = self.storage_service.store(file, title=payload.title)

        document_payload = payload.model_copy(
            update={
                "drive_file_id": stored_file.file_id,
                "drive_file_name": stored_file.file_name,
                "drive_web_view_link": stored_file.web_view_link,
                "drive_folder_id": getattr(stored_file, "folder_id", None),
                "mime_type": stored_file.mime_type,
                "file_size": stored_file.file_size,
            }
        )

        try:
            status = (
                DocumentConstants.DOCUMENT_STATUS_ARCHIVED
                if submission_mode == "archive"
                else DocumentConstants.DOCUMENT_STATUS_REGISTERED
            )
            return self.document_service.create(document_payload, uploaded_by_id, status=status)
        except Exception:
            self.storage_service.remove(getattr(stored_file, "storage_ref", stored_file.web_view_link))
            raise
