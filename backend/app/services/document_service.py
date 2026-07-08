from datetime import datetime, timezone

from sqlalchemy import desc, func
from sqlalchemy.orm import joinedload
from sqlalchemy.orm import Session

from app.core.constants import DocumentConstants
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentUpdate


class DocumentService:
    def __init__(self, db: Session):
        self.db = db

    def list_documents(self) -> list[Document]:
        return (
            self.db.query(Document)
            .options(
                joinedload(Document.uploaded_by),
                joinedload(Document.current_responsible),
            )
            .filter(Document.deleted_at.is_(None))
            .order_by(desc(Document.created_at))
            .all()
        )

    def get_by_id(self, document_id) -> Document | None:
        return (
            self.db.query(Document)
            .options(
                joinedload(Document.uploaded_by),
                joinedload(Document.current_responsible),
            )
            .filter(Document.id == document_id, Document.deleted_at.is_(None))
            .first()
        )

    def get_by_code(self, code: str) -> Document | None:
        return (
            self.db.query(Document)
            .options(
                joinedload(Document.uploaded_by),
                joinedload(Document.current_responsible),
            )
            .filter(Document.code == code, Document.deleted_at.is_(None))
            .first()
        )

    def generate_code(self) -> str:
        current_year = datetime.now().year
        prefix = f"DOC-{current_year}-"

        max_code = (
            self.db.query(func.max(Document.code))
            .filter(Document.code.like(f"{prefix}%"))
            .scalar()
        )

        if not max_code:
            sequence = 1
        else:
            try:
                sequence = int(max_code.split("-")[-1]) + 1
            except (ValueError, IndexError):
                sequence = 1

        return f"{prefix}{sequence:04d}"

    def _ensure_user_exists(self, user_id) -> None:
        if user_id is None:
            return

        user_exists = self.db.query(User.id).filter(User.id == user_id).first()
        if user_exists is None:
            raise ValueError("El usuario responsable no existe")

    def create(self, payload: DocumentCreate, uploaded_by_id, status: str | None = None) -> Document:
        self._ensure_user_exists(payload.current_responsible_id)

        document = Document(
            code=self.generate_code(),
            title=payload.title,
            description=payload.description,
            status=status or DocumentConstants.DOCUMENT_STATUS_REGISTERED,
            drive_file_id=payload.drive_file_id,
            drive_file_name=payload.drive_file_name,
            drive_web_view_link=payload.drive_web_view_link,
            mime_type=payload.mime_type,
            file_size=payload.file_size,
            uploaded_by_id=uploaded_by_id,
            current_responsible_id=payload.current_responsible_id,
        )
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def update(self, document: Document, payload: DocumentUpdate) -> Document:
        update_data = payload.model_dump(exclude_unset=True)
        if "current_responsible_id" in update_data:
            self._ensure_user_exists(update_data["current_responsible_id"])

        for field, value in update_data.items():
            setattr(document, field, value)

        self.db.commit()
        self.db.refresh(document)
        return document

    def logical_delete(self, document: Document) -> Document:
        document.deleted_at = datetime.now(timezone.utc)
        document.status = DocumentConstants.DOCUMENT_STATUS_LOGICALLY_DELETED
        self.db.commit()
        self.db.refresh(document)
        return document
