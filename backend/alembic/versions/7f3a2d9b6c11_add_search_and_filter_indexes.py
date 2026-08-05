"""add search and filter indexes

Revision ID: 7f3a2d9b6c11
Revises: 0daba4879a8e
Create Date: 2026-08-05 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7f3a2d9b6c11"
down_revision: Union[str, Sequence[str], None] = "0daba4879a8e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm')

    op.create_index("ix_documents_status", "documents", ["status"], unique=False)
    op.create_index("ix_documents_uploaded_by_id", "documents", ["uploaded_by_id"], unique=False)
    op.create_index("ix_documents_current_responsible_id", "documents", ["current_responsible_id"], unique=False)
    op.create_index("ix_documents_folder_id", "documents", ["folder_id"], unique=False)
    op.create_index("ix_documents_created_at", "documents", ["created_at"], unique=False)
    op.create_index("ix_document_folders_parent_id", "document_folders", ["parent_id"], unique=False)
    op.create_index(
        "ix_documents_title_trgm",
        "documents",
        ["title"],
        unique=False,
        postgresql_using="gin",
        postgresql_ops={"title": "gin_trgm_ops"},
    )
    op.create_index(
        "ix_documents_description_trgm",
        "documents",
        ["description"],
        unique=False,
        postgresql_using="gin",
        postgresql_ops={"description": "gin_trgm_ops"},
    )


def downgrade() -> None:
    op.drop_index("ix_documents_description_trgm", table_name="documents")
    op.drop_index("ix_documents_title_trgm", table_name="documents")
    op.drop_index("ix_document_folders_parent_id", table_name="document_folders")
    op.drop_index("ix_documents_created_at", table_name="documents")
    op.drop_index("ix_documents_folder_id", table_name="documents")
    op.drop_index("ix_documents_current_responsible_id", table_name="documents")
    op.drop_index("ix_documents_uploaded_by_id", table_name="documents")
    op.drop_index("ix_documents_status", table_name="documents")
