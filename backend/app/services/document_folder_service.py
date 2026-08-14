from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.document_folder import DocumentFolder


@dataclass(frozen=True)
class FolderPathNode:
    name: str
    path: str
    parent: DocumentFolder | None


class DocumentFolderService:
    def __init__(self, db: Session):
        self.db = db

    def resolve_path(self, folder_path: str | None, drive_folder_id: str | None = None) -> DocumentFolder | None:
        if not folder_path:
            return None

        current_parent = None
        current_path = ""
        current_folder = None

        for part in [segment.strip() for segment in folder_path.split("/") if segment.strip()]:
            current_path = f"{current_path}/{part}" if current_path else part
            folder = self.db.query(DocumentFolder).filter(DocumentFolder.path == current_path).first()
            if folder is None:
                folder = DocumentFolder(
                    name=part,
                    path=current_path,
                    parent_id=current_parent.id if current_parent else None,
                    drive_folder_id=drive_folder_id if current_path == folder_path else None,
                )
                self.db.add(folder)
                self.db.flush()
            elif drive_folder_id and current_path == folder_path and folder.drive_folder_id != drive_folder_id:
                folder.drive_folder_id = drive_folder_id

            current_parent = folder
            current_folder = folder

        self.db.flush()
        return current_folder
