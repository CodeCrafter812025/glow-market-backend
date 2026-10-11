"""Phase 1: identity & ownership (users/oidc_states + sellers.user_id FK + products FK)

Revision ID: a1b2c3d4e5f6
Revises: a073f14e58cb
Create Date: 2026-09-30

Adds the tables that were previously created only by ``Base.metadata.create_all``
(so Alembic can be the single source of truth), then links ``sellers`` to ``users``
and ``products`` to ``sellers`` with real foreign keys.

The FK additions use ``batch_alter_table`` so the migration is portable across
PostgreSQL (production) and SQLite (local/test) dialects.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'a073f14e58cb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- users / oidc_states (previously create_all only) ------------------ #
    op.create_table(
        'users',
        sa.Column('id', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('role', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    op.create_table(
        'oidc_states',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('state', sa.String(255), nullable=False),
        sa.Column('nonce', sa.String(255), nullable=False),
        sa.Column('code_verifier', sa.String(255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_oidc_states_id'), 'oidc_states', ['id'], unique=False)
    op.create_index(op.f('ix_oidc_states_state'), 'oidc_states', ['state'], unique=True)

    # --- sellers.user_id -> users.id (one user = one seller) ---------------- #
    with op.batch_alter_table('sellers') as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.String(255), nullable=True))
        batch_op.create_index('ix_sellers_user_id', ['user_id'], unique=True)
        batch_op.create_foreign_key('fk_sellers_user_id_users', 'users', ['user_id'], ['id'])

    # --- products.seller_id -> sellers.id (referential integrity) ----------- #
    with op.batch_alter_table('products') as batch_op:
        batch_op.create_foreign_key('fk_products_seller_id_sellers', 'sellers', ['seller_id'], ['id'])


def downgrade() -> None:
    with op.batch_alter_table('products') as batch_op:
        batch_op.drop_constraint('fk_products_seller_id_sellers', type_='foreignkey')

    with op.batch_alter_table('sellers') as batch_op:
        batch_op.drop_constraint('fk_sellers_user_id_users', type_='foreignkey')
        batch_op.drop_index('ix_sellers_user_id')
        batch_op.drop_column('user_id')

    op.drop_index(op.f('ix_oidc_states_state'), table_name='oidc_states')
    op.drop_index(op.f('ix_oidc_states_id'), table_name='oidc_states')
    op.drop_table('oidc_states')

    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
