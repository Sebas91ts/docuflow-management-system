from __future__ import annotations

from pathlib import Path
from typing import Protocol

from fastapi import UploadFile


class StoredDocumentFileProtocol(Protocol):
    file_id: str
    file_name: str
    web_view_link: str
    mime_type: str | None
    file_size: int | None


class DocumentStorageService(Protocol):
    def store(self, file: UploadFile, title: str | None = None) -> StoredDocumentFileProtocol: ...

    def remove(self, web_view_link: str | Path) -> None: ...
