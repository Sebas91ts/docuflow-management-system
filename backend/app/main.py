import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, users, documents, document_assignments
from app.services.pending_notification_manager import pending_notification_manager

app = FastAPI(
    title=settings.APP_NAME,
    description="API para el Sistema de Gestion Documental DocuFlow",
    version="1.0.0",
)


@app.on_event("startup")
async def startup_event():
    pending_notification_manager.set_loop(asyncio.get_running_loop())

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.137.102:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(documents.router)
app.include_router(document_assignments.router)


@app.get("/")
async def root():
    return {
        "message": "DocuFlow API funcionando correctamente",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
    }
