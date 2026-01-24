"""Add referral tables

Revision ID: 003_referral_system
Revises: 002_user_enhancements
Create Date: 2026-01-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers
revision = '003_referral_system'
down_revision = '002_user_enhancements'
branch_labels = None
depends_on = None


def upgrade():
    # Create referrals table
    op.create_table(
        'vetsready_referrals',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('referrer_user_id', UUID(as_uuid=True), sa.ForeignKey('vetsready_users.id'), nullable=False),
        sa.Column('referred_user_id', UUID(as_uuid=True), sa.ForeignKey('vetsready_users.id'), nullable=True),
        sa.Column('referral_code', sa.String(20), unique=True, nullable=False),
        sa.Column('referred_email', sa.String(255), nullable=True),
        sa.Column('reward_type', sa.String(50), nullable=False),
        sa.Column('reward_value', sa.Numeric(10, 2), nullable=True),
        sa.Column('reward_claimed', sa.Boolean(), default=False),
        sa.Column('reward_claimed_at', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(20), default='pending'),
        sa.Column('conversion_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()')),
    )

    # Create referral rewards table
    op.create_table(
        'vetsready_referral_rewards',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('vetsready_users.id'), nullable=False),
        sa.Column('referral_id', UUID(as_uuid=True), sa.ForeignKey('vetsready_referrals.id'), nullable=False),
        sa.Column('reward_type', sa.String(50), nullable=False),
        sa.Column('reward_value', sa.Numeric(10, 2), nullable=True),
        sa.Column('stripe_coupon_id', sa.String(255), nullable=True),
        sa.Column('stripe_promotion_code_id', sa.String(255), nullable=True),
        sa.Column('applied_at', sa.DateTime(), server_default=sa.text('now()')),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
    )

    # Create indexes
    op.create_index('ix_referrals_code', 'vetsready_referrals', ['referral_code'])
    op.create_index('ix_referrals_referrer', 'vetsready_referrals', ['referrer_user_id'])
    op.create_index('ix_referrals_status', 'vetsready_referrals', ['status'])
    op.create_index('ix_referral_rewards_user', 'vetsready_referral_rewards', ['user_id'])


def downgrade():
    op.drop_index('ix_referral_rewards_user', 'vetsready_referral_rewards')
    op.drop_index('ix_referrals_status', 'vetsready_referrals')
    op.drop_index('ix_referrals_referrer', 'vetsready_referrals')
    op.drop_index('ix_referrals_code', 'vetsready_referrals')
    op.drop_table('vetsready_referral_rewards')
    op.drop_table('vetsready_referrals')
