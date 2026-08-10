import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.document import UserShortRead


class DocumentEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    document_id: uuid.UUID
    user_id: uuid.UUID
    action: str
    previous_status: str | None
    new_status: str | None
    previous_responsible_id: uuid.UUID | None
    new_responsible_id: uuid.UUID | None
    comment: str | None
    metadata_: dict | None
    created_at: datetime
    user: UserShortRead
    previous_responsible: UserShortRead | None
    new_responsible: UserShortRead | None
