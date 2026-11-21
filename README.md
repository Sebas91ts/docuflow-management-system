# DocuFlow Management System

> Document management platform for the Social Work program at UAGRM.

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)
![Alembic](https://img.shields.io/badge/Alembic-6BA539?style=flat-square&logo=alembic&logoColor=white)
![Google Drive](https://img.shields.io/badge/Google%20Drive-4285F4?style=flat-square&logo=googledrive&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

## Overview

DocuFlow centralizes the document workflow of the Social Work program at **Universidad Autónoma Gabriel René Moreno (UAGRM)**. It replaces scattered files and manual follow-up with a traceable flow:

- document intake, classification, folders and related documents;
- assignment to responsible users with pending, attended, derived, resolved and archived states;
- event timeline, audit log and in-app notifications;
- role-based access for administrators and staff;
- optional Google Drive storage for document files.

## Architecture

```text
DocuFlow/
├── backend/    FastAPI + SQLAlchemy + Alembic + PostgreSQL + Google Drive
└── frontend/   React 19 + Vite + Tailwind CSS 4 + React Router 7
```

```text
React SPA ──REST / JWT──► FastAPI ──► PostgreSQL
                              ├──► Google Drive (optional storage)
                              └──► notification manager
```

## Modules

| Module | Stack | Responsibility |
|---|---|---|
| `backend/` | Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL, Pydantic Settings, Google Drive API | Auth, users, documents, folders, assignments, events, notifications, audit |
| `frontend/` | React 19, Vite, Tailwind CSS 4, React Router 7, Axios | Login, dashboard, document explorer, traceability, audit and user management |

### Main backend capabilities

- JWT authentication and role-aware access.
- Document CRUD with logical deletion and related-document links.
- Folder tree and document explorer.
- Assignment lifecycle: pending, attend, derive, resolve, archive.
- Timeline and audit log per document.
- Pending notification manager.
- Google Drive integration with shared-drive and root-folder configuration.

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 14+
- Optional: Google service account with Drive access

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # fill database, secret and Google Drive values
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API: `http://localhost:8000`  
Swagger UI: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm ci
cp .env.example .env             # VITE_API_URL=http://127.0.0.1:8000/api
npm run dev
```

App: `http://localhost:5173`

## Environment variables

| Module | Key variables |
|---|---|
| `backend` | `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_DRIVE_*`, `CORS_ORIGINS` |
| `frontend` | `VITE_API_URL` |

Never commit a real `.env`. Use the provided `.env.example` files.

## Main API areas

| Prefix | Purpose |
|---|---|
| `/auth` | Login and session |
| `/users` | User management and profile |
| `/documents` | Document CRUD, search, folders, timeline, related documents |
| `/assignments` | Pending work, attend, derive, resolve and archive |

## Security

- Secrets are read from environment variables.
- No `.env` file or Google credentials are tracked.
- Google service-account JSON must be provided through the environment, never committed.

## Context

This project was built for the Social Work program at UAGRM and is now maintained as a standalone portfolio project.
