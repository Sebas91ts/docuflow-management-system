from app.models import document_assignment
from app.services import document_drive_storage_service
from datetime import date, datetime, time, timezone

from sqlalchemy import desc, func, or_
from sqlalchemy.orm import aliased
from sqlalchemy.orm import joinedload
from sqlalchemy.orm import Session

from app.core.constants import DocumentConstants
from app.models.document import Document
from app.models.document_folder import DocumentFolder
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentUpdate
import io


class DocumentService:
    def __init__(self, db: Session):
        self.db = db

    def _normalize_start(self, value):
        if value is None:
            return None
        if isinstance(value, datetime) and value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        if isinstance(value, date) and not isinstance(value, datetime):
            return datetime.combine(value, time.min, tzinfo=timezone.utc)
        return value

    def _normalize_end(self, value):
        if value is None:
            return None
        if isinstance(value, datetime) and value.tzinfo is None:
            return value.replace(hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc)
        if isinstance(value, date) and not isinstance(value, datetime):
            return datetime.combine(value, time.max, tzinfo=timezone.utc)
        return value

    def list_documents(
        self,
        *,
        search: str | None = None,
        status: str | None = None,
        uploaded_by: str | None = None,
        current_responsible: str | None = None,
        folder_id=None,
        created_from=None,
        created_to=None,
        limit: int | None = None,
        offset: int | None = None,
    ) -> list[Document]:
        uploaded_by_user = aliased(User)
        responsible_user = aliased(User)
        query = (
            self.db.query(Document)
            .options(
                joinedload(Document.uploaded_by),
                joinedload(Document.current_responsible),
                joinedload(Document.folder),
            )
            .outerjoin(uploaded_by_user, Document.uploaded_by_id == uploaded_by_user.id)
            .outerjoin(responsible_user, Document.current_responsible_id == responsible_user.id)
            .filter(Document.deleted_at.is_(None))
        )

        if search:
            pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Document.title.ilike(pattern),
                    Document.description.ilike(pattern),
                )
            )
        if status:
            query = query.filter(Document.status == status)
        if uploaded_by:
            uploaded_by_pattern = f"%{uploaded_by.strip()}%"
            query = query.filter(
                or_(
                    uploaded_by_user.full_name.ilike(uploaded_by_pattern),
                    uploaded_by_user.username.ilike(uploaded_by_pattern),
                )
            )
        if current_responsible:
            responsible_pattern = f"%{current_responsible.strip()}%"
            query = query.filter(
                or_(
                    responsible_user.full_name.ilike(responsible_pattern),
                    responsible_user.username.ilike(responsible_pattern),
                )
            )
        if folder_id:
            query = query.filter(Document.folder_id == folder_id)
        created_from = self._normalize_start(created_from)
        created_to = self._normalize_end(created_to)
        if created_from:
            query = query.filter(Document.created_at >= created_from)
        if created_to:
            query = query.filter(Document.created_at <= created_to)

        query = query.order_by(desc(Document.created_at))
        if limit is not None:
            query = query.limit(limit)
        if offset is not None:
            query = query.offset(offset)

        return query.all()

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

    def create(
        self,
        payload: DocumentCreate,
        uploaded_by_id,
        status: str | None = None,
        *,
        commit: bool = True,
    ) -> Document:
        self._ensure_user_exists(payload.current_responsible_id)

        document = Document(
            code=self.generate_code(),
            title=payload.title,
            description=payload.description,
            status=status or DocumentConstants.DOCUMENT_STATUS_REGISTERED,
            drive_file_id=payload.drive_file_id,
            drive_file_name=payload.drive_file_name,
            drive_web_view_link=payload.drive_web_view_link,
            drive_folder_id=payload.drive_folder_id,
            drive_folder_path=payload.drive_folder_path,
            folder_id=payload.folder_id,
            mime_type=payload.mime_type,
            file_size=payload.file_size,
            uploaded_by_id=uploaded_by_id,
            current_responsible_id=payload.current_responsible_id,
        )
        self.db.add(document)
        if commit:
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

    #FOLDERS
    def list_folders(self, parent_id=None) -> list[DocumentFolder]:
        query = self.db.query(DocumentFolder).order_by(DocumentFolder.path.asc())
        if parent_id is not None:
            query = query.filter(DocumentFolder.parent_id == parent_id)

        return query.all()
