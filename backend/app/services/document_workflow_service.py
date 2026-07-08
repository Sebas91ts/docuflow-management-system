from __future__ import annotations

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.constants import DocumentConstants
from app.schemas.document import DocumentCreate
from app.services.document_file_storage_service import DocumentFileStorageService
from app.services.document_service import DocumentService


class DocumentWorkflowService:
    def __init__(self, db: Session, storage_service: DocumentFileStorageService | None = None):
        self.db = db
        self.storage_service = storage_service or DocumentFileStorageService()
        self.document_service = DocumentService(db)

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
            self.storage_service.remove(stored_file.web_view_link)
            raise
