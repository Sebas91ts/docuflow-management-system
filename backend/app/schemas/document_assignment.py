import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.document import DocumentShortRead, UserShortRead


class DocumentAssignmentBase(BaseModel):
    document_id: uuid.UUID
    assigned_to_id: uuid.UUID
    message: str | None = None
    due_date: date | None = None


class DocumentAssignmentCreate(DocumentAssignmentBase):
    pass


class DocumentAssignmentResolve(BaseModel):
    status: str = Field(default="RESOLVED", max_length=40)


class DocumentAssignmentArchive(BaseModel):
    comment: str | None = Field(default=None, max_length=1000)


class DocumentAssignmentDerive(BaseModel):
    assigned_to_id: uuid.UUID
    message: str | None = Field(default=None, max_length=1000)
    due_date: date | None = None


class DocumentAssignmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    document_id: uuid.UUID
    assigned_by_id: uuid.UUID
    assigned_to_id: uuid.UUID
    message: str | None
    due_date: date | None
    status: str
    created_at: datetime
    resolved_at: datetime | None
    assigned_by: UserShortRead
    assigned_to: UserShortRead
    document: DocumentShortRead
