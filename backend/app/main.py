from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, users

app = FastAPI(
    title=settings.APP_NAME,
    description="API para el Sistema de Gestion Documental DocuFlow",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)


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
