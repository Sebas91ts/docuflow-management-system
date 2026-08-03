import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import DocumentConstants


class UserShortRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    username: str


class DocumentBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    current_responsible_id: uuid.UUID | None = None
    drive_file_id: str | None = Field(default=None, max_length=255)
    drive_file_name: str | None = Field(default=None, max_length=255)
    drive_web_view_link: str | None = Field(default=None, max_length=500)
    drive_folder_id: str | None = Field(default=None, max_length=255)
    mime_type: str | None = Field(default=None, max_length=120)
    file_size: int | None = None


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    status: str | None = Field(default=None, max_length=40)
    current_responsible_id: uuid.UUID | None = None
    drive_file_id: str | None = Field(default=None, max_length=255)
    drive_file_name: str | None = Field(default=None, max_length=255)
    drive_web_view_link: str | None = Field(default=None, max_length=500)
    drive_folder_id: str | None = Field(default=None, max_length=255)
    mime_type: str | None = Field(default=None, max_length=120)
    file_size: int | None = None


class DocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    title: str
    description: str | None
    status: str
    drive_file_id: str | None
    drive_file_name: str | None
    drive_web_view_link: str | None
    drive_folder_id: str | None
    mime_type: str | None
    file_size: int | None
    uploaded_by_id: uuid.UUID
    current_responsible_id: uuid.UUID | None
    uploaded_by: UserShortRead
    current_responsible: UserShortRead | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class DocumentCodeResponse(BaseModel):
    code: str


class DocumentStatusResponse(BaseModel):
    status: str = DocumentConstants.DOCUMENT_STATUS_REGISTERED


class DocumentFileUploadResponse(BaseModel):
    file_id: str
    file_name: str
    web_view_link: str
    mime_type: str | None
    file_size: int | None
