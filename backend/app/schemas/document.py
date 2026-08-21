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
    drive_folder_path: str | None = Field(default=None, max_length=500)
    folder_id: uuid.UUID | None = None
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
    drive_folder_path: str | None = Field(default=None, max_length=500)
    folder_id: uuid.UUID | None = None
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
    drive_folder_path: str | None
    folder_id: uuid.UUID | None
    mime_type: str | None
    file_size: int | None
    uploaded_by_id: uuid.UUID
    current_responsible_id: uuid.UUID | None
    uploaded_by: UserShortRead
    current_responsible: UserShortRead | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class DocumentShortRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    title: str
    status: str
    drive_web_view_link: str


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


class DocumentFolderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    parent_id: uuid.UUID | None
    name: str
    path: str
    drive_folder_id: str | None
    created_at: datetime
    updated_at: datetime


class DocumentFolderNode(DocumentFolderRead):
    documents_count: int = 0


class DocumentEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    document_id: uuid.UUID
    action: str
    previous_status: str | None
    new_status: str | None
    comment: str | None
    created_at: datetime
    user: UserShortRead
    previous_responsible: UserShortRead | None
    new_responsible: UserShortRead | None
