"""Add 2FA and privacy fields to users

Revision ID: 002_user_enhancements
Revises: 001_pricing_tables
Create Date: 2026-01-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '002_user_enhancements'
down_revision = '001_pricing_tables'
branch_labels = None
depends_on = None


def upgrade():
    # Add 2FA columns
    op.add_column('vetsready_users', sa.Column('totp_secret', sa.String(32), nullable=True))
    op.add_column('vetsready_users', sa.Column('totp_enabled', sa.Boolean(), default=False))
    op.add_column('vetsready_users', sa.Column('totp_backup_codes', postgresql.JSON(), nullable=True))

    # Add privacy settings
    op.add_column('vetsready_users', sa.Column('analytics_enabled', sa.Boolean(), default=True))
    op.add_column('vetsready_users', sa.Column('marketing_emails', sa.Boolean(), default=True))
    op.add_column('vetsready_users', sa.Column('data_sharing_vso', sa.Boolean(), default=False))
    op.add_column('vetsready_users', sa.Column('profile_visibility', sa.String(20), default='private'))

    # Add account management
    op.add_column('vetsready_users', sa.Column('last_login', sa.DateTime(), nullable=True))
    op.add_column('vetsready_users', sa.Column('deleted_at', sa.DateTime(), nullable=True))

    # Add user info (if not already exists)
    op.add_column('vetsready_users', sa.Column('user_type', sa.String(20), default='veteran'))
    op.add_column('vetsready_users', sa.Column('military_branch', sa.String(50), nullable=True))
    op.add_column('vetsready_users', sa.Column('service_start_date', sa.DateTime(), nullable=True))
    op.add_column('vetsready_users', sa.Column('service_end_date', sa.DateTime(), nullable=True))
    op.add_column('vetsready_users', sa.Column('discharge_type', sa.String(50), nullable=True))
    op.add_column('vetsready_users', sa.Column('mos', sa.String(20), nullable=True))

    # Add subscription info
    op.add_column('vetsready_users', sa.Column('subscription_tier', sa.String(20), default='FREE'))
    op.add_column('vetsready_users', sa.Column('subscription_status', sa.String(20), default='active'))
    op.add_column('vetsready_users', sa.Column('stripe_customer_id', sa.String(255), nullable=True))

    # Create indexes for performance
    op.create_index('ix_users_totp_enabled', 'vetsready_users', ['totp_enabled'])
    op.create_index('ix_users_deleted_at', 'vetsready_users', ['deleted_at'])
    op.create_index('ix_users_stripe_customer_id', 'vetsready_users', ['stripe_customer_id'])


def downgrade():
    # Drop indexes
    op.drop_index('ix_users_stripe_customer_id', 'vetsready_users')
    op.drop_index('ix_users_deleted_at', 'vetsready_users')
    op.drop_index('ix_users_totp_enabled', 'vetsready_users')

    # Drop columns
    op.drop_column('vetsready_users', 'stripe_customer_id')
    op.drop_column('vetsready_users', 'subscription_status')
    op.drop_column('vetsready_users', 'subscription_tier')
    op.drop_column('vetsready_users', 'mos')
    op.drop_column('vetsready_users', 'discharge_type')
    op.drop_column('vetsready_users', 'service_end_date')
    op.drop_column('vetsready_users', 'service_start_date')
    op.drop_column('vetsready_users', 'military_branch')
    op.drop_column('vetsready_users', 'user_type')
    op.drop_column('vetsready_users', 'deleted_at')
    op.drop_column('vetsready_users', 'last_login')
    op.drop_column('vetsready_users', 'profile_visibility')
    op.drop_column('vetsready_users', 'data_sharing_vso')
    op.drop_column('vetsready_users', 'marketing_emails')
    op.drop_column('vetsready_users', 'analytics_enabled')
    op.drop_column('vetsready_users', 'totp_backup_codes')
    op.drop_column('vetsready_users', 'totp_enabled')
    op.drop_column('vetsready_users', 'totp_secret')
