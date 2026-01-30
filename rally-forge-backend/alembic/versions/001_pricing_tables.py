"""Add pricing and monetization tables

Revision ID: 001
Revises:
Create Date: 2026-01-24 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_pricing_tables'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create pricing and monetization tables"""

    # Veteran Subscriptions
    op.create_table(
        'rallyforge_veteran_subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('rallyforge_users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('tier', sa.String(20), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='ACTIVE'),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('end_date', sa.DateTime(timezone=True)),
        sa.Column('auto_renew', sa.Boolean(), server_default='false'),
        sa.Column('payment_method', sa.String(50)),
        sa.Column('stripe_subscription_id', sa.String(255)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.CheckConstraint("tier IN ('FREE', 'PRO', 'FAMILY', 'LIFETIME')", name='ck_veteran_tier'),
        sa.CheckConstraint("status IN ('ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED')", name='ck_veteran_status'),
        sa.UniqueConstraint('user_id', name='uq_veteran_subscription_user')
    )

    # Employer Accounts
    op.create_table(
        'rallyforge_employer_accounts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('company_name', sa.String(255), nullable=False),
        sa.Column('contact_name', sa.String(255), nullable=False),
        sa.Column('contact_email', sa.String(255), nullable=False, unique=True),
        sa.Column('contact_phone', sa.String(50)),
        sa.Column('tier', sa.String(20), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='ACTIVE'),
        sa.Column('job_posts_used', sa.Integer(), server_default='0'),
        sa.Column('job_posts_limit', sa.Integer(), nullable=False),
        sa.Column('applications_received', sa.Integer(), server_default='0'),
        sa.Column('billing_cycle', sa.String(20), server_default='MONTHLY'),
        sa.Column('next_billing_date', sa.DateTime(timezone=True)),
        sa.Column('stripe_customer_id', sa.String(255)),
        sa.Column('stripe_subscription_id', sa.String(255)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.CheckConstraint("tier IN ('BASIC', 'PREMIUM', 'RECRUITING', 'ENTERPRISE')", name='ck_employer_tier'),
        sa.CheckConstraint("status IN ('ACTIVE', 'SUSPENDED', 'CANCELLED')", name='ck_employer_status')
    )

    # Job Posts
    op.create_table(
        'rallyforge_job_posts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('employer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('rallyforge_employer_accounts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('location', sa.String(255)),
        sa.Column('job_type', sa.String(50)),
        sa.Column('salary_min', sa.Numeric(12, 2)),
        sa.Column('salary_max', sa.Numeric(12, 2)),
        sa.Column('required_clearance', sa.String(50)),
        sa.Column('remote_options', sa.String(50)),
        sa.Column('status', sa.String(20), server_default='ACTIVE'),
        sa.Column('views_count', sa.Integer(), server_default='0'),
        sa.Column('applications_count', sa.Integer(), server_default='0'),
        sa.Column('featured', sa.Boolean(), server_default='false'),
        sa.Column('expires_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.CheckConstraint("status IN ('ACTIVE', 'PAUSED', 'FILLED', 'EXPIRED')", name='ck_job_status')
    )

    # Business Listings
    op.create_table(
        'rallyforge_business_listings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('business_name', sa.String(255), nullable=False),
        sa.Column('contact_name', sa.String(255), nullable=False),
        sa.Column('contact_email', sa.String(255), nullable=False, unique=True),
        sa.Column('contact_phone', sa.String(50)),
        sa.Column('tier', sa.String(20), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='ACTIVE'),
        sa.Column('category', sa.String(100)),
        sa.Column('description', sa.Text()),
        sa.Column('address', sa.Text()),
        sa.Column('website', sa.String(500)),
        sa.Column('veteran_owned', sa.Boolean(), server_default='false'),
        sa.Column('logo_url', sa.String(500)),
        sa.Column('featured_until', sa.DateTime(timezone=True)),
        sa.Column('views_count', sa.Integer(), server_default='0'),
        sa.Column('clicks_count', sa.Integer(), server_default='0'),
        sa.Column('billing_cycle', sa.String(20), server_default='MONTHLY'),
        sa.Column('next_billing_date', sa.DateTime(timezone=True)),
        sa.Column('stripe_customer_id', sa.String(255)),
        sa.Column('stripe_subscription_id', sa.String(255)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.CheckConstraint("tier IN ('BASIC', 'FEATURED', 'PREMIUM', 'ADVERTISING')", name='ck_business_tier'),
        sa.CheckConstraint("status IN ('ACTIVE', 'SUSPENDED', 'CANCELLED')", name='ck_business_status')
    )

    # Leads
    op.create_table(
        'rallyforge_leads',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('source_type', sa.String(50), nullable=False),
        sa.Column('source_id', postgresql.UUID(as_uuid=True)),
        sa.Column('veteran_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('rallyforge_users.id')),
        sa.Column('business_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('rallyforge_business_listings.id')),
        sa.Column('employer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('rallyforge_employer_accounts.id')),
        sa.Column('lead_type', sa.String(50), nullable=False),
        sa.Column('status', sa.String(20), server_default='NEW'),
        sa.Column('value', sa.Numeric(10, 2)),
        sa.Column('notes', sa.Text()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.CheckConstraint("source_type IN ('JOB_APPLICATION', 'BUSINESS_CONTACT', 'EMPLOYER_INQUIRY', 'OTHER')", name='ck_lead_source'),
        sa.CheckConstraint("status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST')", name='ck_lead_status')
    )

    # VSO Partners
    op.create_table(
        'rallyforge_vso_partners',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_name', sa.String(255), nullable=False),
        sa.Column('contact_name', sa.String(255), nullable=False),
        sa.Column('contact_email', sa.String(255), nullable=False, unique=True),
        sa.Column('contact_phone', sa.String(50)),
        sa.Column('partnership_type', sa.String(50)),
        sa.Column('status', sa.String(20), server_default='ACTIVE'),
        sa.Column('referrals_sent', sa.Integer(), server_default='0'),
        sa.Column('veterans_helped', sa.Integer(), server_default='0'),
        sa.Column('revenue_share_percentage', sa.Numeric(5, 2)),
        sa.Column('agreement_start_date', sa.Date()),
        sa.Column('agreement_end_date', sa.Date()),
        sa.Column('notes', sa.Text()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.CheckConstraint("partnership_type IN ('REFERRAL', 'DATA_SHARING', 'CO_BRANDED', 'FULL')", name='ck_vso_type'),
        sa.CheckConstraint("status IN ('ACTIVE', 'PENDING', 'SUSPENDED', 'TERMINATED')", name='ck_vso_status')
    )

    # Invoices
    op.create_table(
        'rallyforge_invoices',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_type', sa.String(20), nullable=False),
        sa.Column('customer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('invoice_number', sa.String(50), nullable=False, unique=True),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('tax', sa.Numeric(10, 2), server_default='0'),
        sa.Column('total', sa.Numeric(10, 2), nullable=False),
        sa.Column('status', sa.String(20), server_default='PENDING'),
        sa.Column('due_date', sa.Date()),
        sa.Column('paid_date', sa.DateTime(timezone=True)),
        sa.Column('stripe_invoice_id', sa.String(255)),
        sa.Column('stripe_payment_intent_id', sa.String(255)),
        sa.Column('description', sa.Text()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.CheckConstraint("customer_type IN ('VETERAN', 'EMPLOYER', 'BUSINESS', 'VSO')", name='ck_invoice_customer_type'),
        sa.CheckConstraint("status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED')", name='ck_invoice_status')
    )

    # Payments
    op.create_table(
        'rallyforge_payments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('invoice_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('rallyforge_invoices.id', ondelete='SET NULL')),
        sa.Column('customer_type', sa.String(20), nullable=False),
        sa.Column('customer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('payment_method', sa.String(50)),
        sa.Column('status', sa.String(20), server_default='PENDING'),
        sa.Column('stripe_payment_id', sa.String(255)),
        sa.Column('error_message', sa.Text()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.CheckConstraint("status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED')", name='ck_payment_status')
    )

    # Create indexes
    op.create_index('idx_veteran_subscriptions_user', 'rallyforge_veteran_subscriptions', ['user_id'])
    op.create_index('idx_veteran_subscriptions_tier', 'rallyforge_veteran_subscriptions', ['tier'])
    op.create_index('idx_veteran_subscriptions_status', 'rallyforge_veteran_subscriptions', ['status'])

    op.create_index('idx_employer_accounts_tier', 'rallyforge_employer_accounts', ['tier'])
    op.create_index('idx_employer_accounts_status', 'rallyforge_employer_accounts', ['status'])
    op.create_index('idx_employer_accounts_email', 'rallyforge_employer_accounts', ['contact_email'])

    op.create_index('idx_job_posts_employer', 'rallyforge_job_posts', ['employer_id'])
    op.create_index('idx_job_posts_status', 'rallyforge_job_posts', ['status'])
    op.create_index('idx_job_posts_featured', 'rallyforge_job_posts', ['featured'])

    op.create_index('idx_business_listings_tier', 'rallyforge_business_listings', ['tier'])
    op.create_index('idx_business_listings_status', 'rallyforge_business_listings', ['status'])
    op.create_index('idx_business_listings_category', 'rallyforge_business_listings', ['category'])

    op.create_index('idx_leads_veteran', 'rallyforge_leads', ['veteran_id'])
    op.create_index('idx_leads_business', 'rallyforge_leads', ['business_id'])
    op.create_index('idx_leads_employer', 'rallyforge_leads', ['employer_id'])
    op.create_index('idx_leads_status', 'rallyforge_leads', ['status'])

    op.create_index('idx_vso_partners_status', 'rallyforge_vso_partners', ['status'])
    op.create_index('idx_vso_partners_email', 'rallyforge_vso_partners', ['contact_email'])

    op.create_index('idx_invoices_customer', 'rallyforge_invoices', ['customer_type', 'customer_id'])
    op.create_index('idx_invoices_status', 'rallyforge_invoices', ['status'])
    op.create_index('idx_invoices_number', 'rallyforge_invoices', ['invoice_number'])

    op.create_index('idx_payments_invoice', 'rallyforge_payments', ['invoice_id'])
    op.create_index('idx_payments_customer', 'rallyforge_payments', ['customer_type', 'customer_id'])
    op.create_index('idx_payments_status', 'rallyforge_payments', ['status'])


def downgrade() -> None:
    """Drop pricing and monetization tables"""

    # Drop indexes first
    op.drop_index('idx_payments_status')
    op.drop_index('idx_payments_customer')
    op.drop_index('idx_payments_invoice')
    op.drop_index('idx_invoices_number')
    op.drop_index('idx_invoices_status')
    op.drop_index('idx_invoices_customer')
    op.drop_index('idx_vso_partners_email')
    op.drop_index('idx_vso_partners_status')
    op.drop_index('idx_leads_status')
    op.drop_index('idx_leads_employer')
    op.drop_index('idx_leads_business')
    op.drop_index('idx_leads_veteran')
    op.drop_index('idx_business_listings_category')
    op.drop_index('idx_business_listings_status')
    op.drop_index('idx_business_listings_tier')
    op.drop_index('idx_job_posts_featured')
    op.drop_index('idx_job_posts_status')
    op.drop_index('idx_job_posts_employer')
    op.drop_index('idx_employer_accounts_email')
    op.drop_index('idx_employer_accounts_status')
    op.drop_index('idx_employer_accounts_tier')
    op.drop_index('idx_veteran_subscriptions_status')
    op.drop_index('idx_veteran_subscriptions_tier')
    op.drop_index('idx_veteran_subscriptions_user')

    # Drop tables
    op.drop_table('rallyforge_payments')
    op.drop_table('rallyforge_invoices')
    op.drop_table('rallyforge_vso_partners')
    op.drop_table('rallyforge_leads')
    op.drop_table('rallyforge_business_listings')
    op.drop_table('rallyforge_job_posts')
    op.drop_table('rallyforge_employer_accounts')
    op.drop_table('rallyforge_veteran_subscriptions')

