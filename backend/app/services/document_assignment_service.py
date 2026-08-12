from datetime import datetime, timezone

from sqlalchemy.orm import Session, joinedload

from app.models.document import Document
from app.models.document_assignment import DocumentAssignment
from app.models.document_event import DocumentEvent
from app.models.user import User
from app.schemas.document_assignment import DocumentAssignmentCreate, DocumentAssignmentResolve
from app.services.pending_notification_manager import pending_notification_manager


class DocumentAssignmentService:
    def __init__(self, db: Session):
        self.db = db

    def _ensure_user(self, user_id) -> None:
        exists = self.db.query(User.id).filter(User.id == user_id).first()
        if exists is None:
            raise ValueError("El usuario no existe")

    def _ensure_document(self, document_id) -> Document:
        document = self.db.query(Document).filter(Document.id == document_id, Document.deleted_at.is_(None)).first()
        if document is None:
            raise ValueError("El documento no existe")
        return document

    def list_by_document(self, document_id) -> list[DocumentAssignment]:
        return (
            self.db.query(DocumentAssignment)
            .options(
                joinedload(DocumentAssignment.assigned_by),
                joinedload(DocumentAssignment.assigned_to),
                joinedload(DocumentAssignment.document),
            )
            .filter(DocumentAssignment.document_id == document_id)
            .order_by(DocumentAssignment.created_at.desc())
            .all()
        )

    def list_pending_for_user(self, user_id) -> list[DocumentAssignment]:
        return (
            self.db.query(DocumentAssignment)
            .options(
                joinedload(DocumentAssignment.assigned_by),
                joinedload(DocumentAssignment.assigned_to),
                joinedload(DocumentAssignment.document),
            )
            .filter(
                DocumentAssignment.assigned_to_id == user_id,
                DocumentAssignment.status == "PENDING",
            )
            .order_by(DocumentAssignment.created_at.desc())
            .all()
        )

    def create(
        self,
        payload: DocumentAssignmentCreate,
        assigned_by_id,
        *,
        commit: bool = True,
    ) -> DocumentAssignment:
        document = self._ensure_document(payload.document_id)
        self._ensure_user(payload.assigned_to_id)
        self._ensure_user(assigned_by_id)

        previous_responsible_id = document.current_responsible_id
        previous_status = document.status
        document.current_responsible_id = payload.assigned_to_id
        document.status = "IN_PROGRESS"

        assignment = DocumentAssignment(
            document_id=payload.document_id,
            assigned_by_id=assigned_by_id,
            assigned_to_id=payload.assigned_to_id,
            message=payload.message,
            due_date=payload.due_date,
            status="PENDING",
        )

        event = DocumentEvent(
            document_id=payload.document_id,
            user_id=assigned_by_id,
            action="ASSIGNED",
            previous_status=previous_status,
            new_status="IN_PROGRESS",
            previous_responsible_id=previous_responsible_id,
            new_responsible_id=payload.assigned_to_id,
            comment=payload.message,
            metadata_={
                "due_date": payload.due_date.isoformat() if payload.due_date else None,
            },
        )

        self.db.add(assignment)
        self.db.add(event)
        if commit:
            self.db.commit()
            self.db.refresh(assignment)
        if commit:
            pending_notification_manager.notify_user_nowait(
                str(payload.assigned_to_id),
                {
                    "type": "document_assignment_created",
                    "assignment_id": str(assignment.id),
                    "document_id": str(assignment.document_id),
                },
            )
        return assignment

    def notify_created(self, assigned_to_id, assignment_id, document_id) -> None:
        pending_notification_manager.notify_user_nowait(
            str(assigned_to_id),
            {
                "type": "document_assignment_created",
                "assignment_id": str(assignment_id),
                "document_id": str(document_id),
            },
        )

    def resolve(
        self,
        assignment: DocumentAssignment,
        payload: DocumentAssignmentResolve,
        *,
        commit: bool = True,
    ) -> DocumentAssignment:
        assignment.status = payload.status
        assignment.resolved_at = datetime.now(timezone.utc)
        if commit:
            self.db.commit()
        self.db.refresh(assignment)
        return assignment

    def get_by_id(self, assignment_id) -> DocumentAssignment | None:
        return (
            self.db.query(DocumentAssignment)
            .options(
                joinedload(DocumentAssignment.assigned_by),
                joinedload(DocumentAssignment.assigned_to),
                joinedload(DocumentAssignment.document),
            )
            .filter(DocumentAssignment.id == assignment_id)
            .first()
        )
