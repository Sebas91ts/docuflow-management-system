from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "DocuFlow"
    ENVIRONMENT: str = "development"

    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    GOOGLE_SERVICE_ACCOUNT_FILE: str | None = None
    GOOGLE_DRIVE_SHARED_DRIVE_ID: str | None = None
    GOOGLE_DRIVE_ROOT_FOLDER_ID: str | None = None
    GOOGLE_DRIVE_INSTITUTION_NAME: str = "Gestion"
    GOOGLE_DRIVE_STORAGE_MODE: str = "local"

    class Config:
        env_file = ".env"


settings = Settings()
