from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from fastapi import UploadFile
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseUpload

from app.core.config import settings


@dataclass(frozen=True)
class StoredDocumentFile:
    file_id: str
    file_name: str
    web_view_link: str
    mime_type: str | None
    file_size: int | None
    folder_id: str | None = None
    folder_path: str | None = None
    storage_ref: str | None = None


class DocumentDriveStorageService:
    SCOPES = ["https://www.googleapis.com/auth/drive"]

    def __init__(self) -> None:
        if not settings.GOOGLE_SERVICE_ACCOUNT_FILE:
            raise ValueError("GOOGLE_SERVICE_ACCOUNT_FILE no esta configurado")

        credentials_path = Path(settings.GOOGLE_SERVICE_ACCOUNT_FILE)
        if not credentials_path.is_absolute():
            backend_root = Path(__file__).resolve().parents[2]
            credentials_path = (backend_root / credentials_path).resolve()

        if not credentials_path.exists():
            raise FileNotFoundError(f"No existe el archivo de credenciales: {credentials_path}")

        credentials = service_account.Credentials.from_service_account_file(
            str(credentials_path),
            scopes=self.SCOPES,
        )
        self.service = build("drive", "v3", credentials=credentials, cache_discovery=False)
        self.shared_drive_id = settings.GOOGLE_DRIVE_SHARED_DRIVE_ID

    def _slugify(self, value: str) -> str:
        normalized = re.sub(r"[^a-zA-Z0-9]+", "_", value).strip("_")
        return normalized or "documento"

    def _query_options(self) -> dict:
        options = {
            "supportsAllDrives": True,
            "includeItemsFromAllDrives": True,
        }
        if self.shared_drive_id:
            options["corpora"] = "drive"
            options["driveId"] = self.shared_drive_id
        return options

    def _ensure_folder(self, name: str, parent_id: str | None) -> str:
        safe_name = name.replace("'", "\\'")
        query = [
            "mimeType = 'application/vnd.google-apps.folder'",
            f"name = '{safe_name}'",
            "trashed = false",
        ]
        if parent_id:
            query.append(f"'{parent_id}' in parents")
        else:
            root = settings.GOOGLE_DRIVE_ROOT_FOLDER_ID
            if root:
                query.append(f"'{root}' in parents")

        response = (
            self.service.files()
            .list(
                q=" and ".join(query),
                spaces="drive",
                fields="files(id, name)",
                pageSize=1,
                **self._query_options(),
            )
            .execute()
        )
        files = response.get("files", [])
        if files:
            return files[0]["id"]

        metadata = {
            "name": name,
            "mimeType": "application/vnd.google-apps.folder",
        }
        if parent_id:
            metadata["parents"] = [parent_id]
        elif settings.GOOGLE_DRIVE_ROOT_FOLDER_ID:
            metadata["parents"] = [settings.GOOGLE_DRIVE_ROOT_FOLDER_ID]

        created = self.service.files().create(
            body=metadata,
            fields="id",
            supportsAllDrives=True,
        ).execute()
        return created["id"]

    def _resolve_target_folder(self) -> str | None:
        year_folder = f"Gestion {datetime.now().year}"
        month_folder = datetime.now().strftime("%B")
        day_folder = datetime.now().strftime("%d")

        language_map = {
            "january": "Enero",
            "february": "Febrero",
            "march": "Marzo",
            "april": "Abril",
            "may": "Mayo",
            "june": "Junio",
            "july": "Julio",
            "august": "Agosto",
            "september": "Septiembre",
            "october": "Octubre",
            "november": "Noviembre",
            "december": "Diciembre",
        }
        month_folder = language_map.get(month_folder.lower(), month_folder)

        folder_id = settings.GOOGLE_DRIVE_ROOT_FOLDER_ID
        folder_id = self._ensure_folder(year_folder, folder_id)
        folder_id = self._ensure_folder(month_folder, folder_id)
        folder_id = self._ensure_folder(day_folder, folder_id)
        folder_path = f"{year_folder}/{month_folder}/{day_folder}"
        return folder_id, folder_path

    def store(self, file: UploadFile, title: str | None = None) -> StoredDocumentFile:
        target_folder_id, target_folder_path = self._resolve_target_folder()
        original_name = Path(file.filename or "documento").name
        extension = Path(original_name).suffix
        safe_title = self._slugify(title or Path(original_name).stem)
        short_id = datetime.now().strftime("%H%M%S")
        stored_name = f"{safe_title}_{short_id}{extension}"

        media = MediaIoBaseUpload(file.file, mimetype=file.content_type, resumable=False)
        metadata = {
            "name": stored_name,
        }
        if target_folder_id:
            metadata["parents"] = [target_folder_id]

        created = (
            self.service.files()
            .create(
                body=metadata,
                media_body=media,
                fields="id, name, webViewLink, mimeType, size",
                supportsAllDrives=True,
            )
            .execute()
        )

        return StoredDocumentFile(
            file_id=created["id"],
            file_name=created["name"],
            web_view_link=created.get("webViewLink", ""),
            folder_id=target_folder_id,
            folder_path=target_folder_path,
            mime_type=created.get("mimeType"),
            file_size=int(created["size"]) if created.get("size") else None,
        )

    def remove(self, web_view_link: str | Path) -> None:
        file_id = str(web_view_link)
        if file_id:
            try:
                self.service.files().delete(fileId=file_id, supportsAllDrives=True).execute()
            except HttpError as exc:
                if getattr(exc.resp, "status", None) == 404:
                    return
                raise
