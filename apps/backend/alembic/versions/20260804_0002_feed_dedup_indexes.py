"""Add deduplication fields and indexes to feed_items.

Revision ID: 20260804_0002
Revises: 20260804_0001
Create Date: 2026-08-04
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "20260804_0002"
down_revision: Union[str, None] = "20260804_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new deduplication columns
    op.add_column("feed_items", sa.Column("source_external_id", sa.String(180), nullable=True, server_default=""))
    op.add_column("feed_items", sa.Column("canonical_url", sa.String(500), nullable=True))
    op.add_column("feed_items", sa.Column("content_hash", sa.String(64), nullable=True))
    op.add_column("feed_items", sa.Column("title_normalized", sa.String(250), nullable=True, server_default=""))

    # Create indexes
    op.create_index("ix_feed_items_source_external_id", "feed_items", ["source_external_id"])
    op.create_index("ix_feed_items_canonical_url", "feed_items", ["canonical_url"])
    op.create_index("ix_feed_items_content_hash", "feed_items", ["content_hash"], unique=True)
    op.create_index("ix_feed_items_title_normalized", "feed_items", ["title_normalized"])
    op.create_index("ix_feed_items_location", "feed_items", ["location"])
    op.create_index("ix_feed_items_country_code", "feed_items", ["country_code"])
    op.create_index("ix_feed_items_severity", "feed_items", ["severity"])
    op.create_index("ix_feed_items_verification_status", "feed_items", ["verification_status"])
    op.create_index("ix_feed_items_collected_at", "feed_items", ["collected_at"])
    op.create_index("ix_feed_items_expires_at", "feed_items", ["expires_at"])


def downgrade() -> None:
    op.drop_index("ix_feed_items_expires_at", table_name="feed_items")
    op.drop_index("ix_feed_items_collected_at", table_name="feed_items")
    op.drop_index("ix_feed_items_verification_status", table_name="feed_items")
    op.drop_index("ix_feed_items_severity", table_name="feed_items")
    op.drop_index("ix_feed_items_country_code", table_name="feed_items")
    op.drop_index("ix_feed_items_location", table_name="feed_items")
    op.drop_index("ix_feed_items_title_normalized", table_name="feed_items")
    op.drop_index("ix_feed_items_content_hash", table_name="feed_items")
    op.drop_index("ix_feed_items_canonical_url", table_name="feed_items")
    op.drop_index("ix_feed_items_source_external_id", table_name="feed_items")

    op.drop_column("feed_items", "title_normalized")
    op.drop_column("feed_items", "content_hash")
    op.drop_column("feed_items", "canonical_url")
    op.drop_column("feed_items", "source_external_id")
