from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import re
from uuid import uuid4

from fastapi import UploadFile


@dataclass(frozen=True)
class StoredDocumentFile:
    file_id: str
    file_name: str
    web_view_link: str
    folder_id: str | None
    folder_path: str | None
    mime_type: str | None
    file_size: int | None
    storage_ref: str


class DocumentFileStorageService:
    def __init__(self, base_dir: str | Path = "storage/documents"):
        self.base_dir = Path(base_dir)

    def _slugify(self, value: str) -> str:
        normalized = re.sub(r"[^a-zA-Z0-9]+", "_", value).strip("_")
        return normalized or "documento"

    def store(self, file: UploadFile, title: str | None = None) -> StoredDocumentFile:
        self.base_dir.mkdir(parents=True, exist_ok=True)

        original_name = Path(file.filename or "documento").name
        extension = Path(original_name).suffix
        safe_title = self._slugify(title or Path(original_name).stem)
        file_id = str(uuid4())
        short_id = file_id.split("-")[0]
        stored_name = f"{safe_title}_{short_id}{extension}"
        target_path = self.base_dir / stored_name

        size = 0
        with target_path.open("wb") as output:
            while True:
                chunk = file.file.read(1024 * 1024)
                if not chunk:
                    break
                size += len(chunk)
                output.write(chunk)

        return StoredDocumentFile(
            file_id=file_id,
            file_name=stored_name,
            web_view_link=str(target_path.as_posix()),
            folder_id=None,
            folder_path=None,
            mime_type=file.content_type,
            file_size=size,
            storage_ref=str(target_path.as_posix()),
        )

    def remove(self, storage_ref: str | Path) -> None:
        target_path = Path(storage_ref)
        if target_path.exists():
            target_path.unlink()
