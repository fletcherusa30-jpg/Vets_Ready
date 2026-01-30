-- Rally Forge Schema
-- All tables prefixed with RallyForge_

CREATE TABLE IF NOT EXISTS RallyForge_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  branch VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investment accounts
CREATE TABLE IF NOT EXISTS RallyForge_investment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES RallyForge_users(id),
  account_type VARCHAR(50) NOT NULL,
  name VARCHAR(255),
  balance DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget scenarios
CREATE TABLE IF NOT EXISTS RallyForge_budget_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES RallyForge_users(id),
  name VARCHAR(255),
  monthly_income DECIMAL(15,2),
  total_expenses DECIMAL(15,2),
  savings_rate DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Retirement scenarios
CREATE TABLE IF NOT EXISTS RallyForge_retirement_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES RallyForge_users(id),
  name VARCHAR(255),
  retirement_age INT,
  life_expectancy INT,
  current_savings DECIMAL(15,2),
  tsp_balance DECIMAL(15,2),
  pension_monthly DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transition checklists
CREATE TABLE IF NOT EXISTS RallyForge_transition_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES RallyForge_users(id),
  separation_date DATE,
  items_completed INT,
  total_items INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents
CREATE TABLE IF NOT EXISTS RallyForge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES RallyForge_users(id),
  document_type VARCHAR(100),
  file_path VARCHAR(500),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resume builds
CREATE TABLE IF NOT EXISTS RallyForge_resume_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES RallyForge_users(id),
  content TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employer profiles
CREATE TABLE IF NOT EXISTS RallyForge_employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  industry VARCHAR(100),
  veteran_hired INT,
  website VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job postings
CREATE TABLE IF NOT EXISTS RallyForge_job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES RallyForge_employer_profiles(id),
  title VARCHAR(255),
  description TEXT,
  required_mos VARCHAR(100),
  salary_range VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Veteran job profiles
CREATE TABLE IF NOT EXISTS RallyForge_veteran_job_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES RallyForge_users(id),
  mos VARCHAR(100),
  rank VARCHAR(50),
  years_experience INT,
  skills TEXT[],
  certifications TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job applications
CREATE TABLE IF NOT EXISTS RallyForge_job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veteran_profile_id UUID NOT NULL REFERENCES RallyForge_veteran_job_profiles(id),
  job_posting_id UUID NOT NULL REFERENCES RallyForge_job_postings(id),
  match_score DECIMAL(3,2),
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== FEDERAL BENEFITS REFERENCE DATA ==========

CREATE TABLE IF NOT EXISTS RallyForge_federal_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benefit_type VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  eligibility_summary TEXT,
  official_link VARCHAR(500),
  last_reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== STATE BENEFITS REFERENCE DATA ==========

CREATE TABLE IF NOT EXISTS RallyForge_state_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code VARCHAR(2) NOT NULL,
  benefit_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  eligibility_summary TEXT,
  official_link VARCHAR(500),
  last_reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(state_code, benefit_type)
);

-- ========== CLAIM READINESS PROFILES ==========

CREATE TABLE IF NOT EXISTS RallyForge_claim_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES RallyForge_users(id),
  conditions TEXT[],
  service_connection_notes TEXT,
  evidence_collected TEXT[],
  ready_to_submit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== TRANSITION PROFILES ==========

CREATE TABLE IF NOT EXISTS RallyForge_transition_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES RallyForge_users(id),
  separation_date DATE,
  mos VARCHAR(100),
  desired_role VARCHAR(255),
  checklist_items TEXT[],
  progress_percentage INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== FINANCIAL SCENARIOS ==========

CREATE TABLE IF NOT EXISTS RallyForge_financial_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES RallyForge_users(id),
  scenario_name VARCHAR(255),
  retirement_age INT,
  expected_return_rate DECIMAL(5,2),
  inflation_rate DECIMAL(5,2),
  life_expectancy INT,
  withdrawal_strategy VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== RESOURCES HUB ==========

CREATE TABLE IF NOT EXISTS RallyForge_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500),
  resource_type VARCHAR(100),
  topic VARCHAR(100),
  level VARCHAR(50),
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== PARTNERSHIPS (EMPLOYMENT & BUSINESS) ==========

CREATE TABLE IF NOT EXISTS RallyForge_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  tier VARCHAR(50) DEFAULT 'free',
  description TEXT,
  website VARCHAR(500),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  logo_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'draft',
  verification_state VARCHAR(50) DEFAULT 'unverified',
  tags TEXT[],
  industries TEXT[],
  locations TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS RallyForge_partner_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES RallyForge_partners(id),
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  remote_flag BOOLEAN,
  compensation_range VARCHAR(100),
  post_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS RallyForge_partner_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES RallyForge_partners(id),
  offer_type VARCHAR(100),
  description TEXT,
  eligibility_notes TEXT,
  start_at TIMESTAMP,
  end_at TIMESTAMP,
  redemption_url VARCHAR(500),
  redemption_code VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS RallyForge_partner_sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES RallyForge_partners(id),
  package VARCHAR(50),
  amount DECIMAL(10,2),
  term VARCHAR(50),
  placement VARCHAR(255),
  start_at TIMESTAMP,
  end_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS RallyForge_partner_affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES RallyForge_partners(id),
  program_name VARCHAR(255),
  tracking_url VARCHAR(500),
  payout_terms TEXT,
  commission_rate DECIMAL(5,2),
  cookie_window_days INT
);

CREATE TABLE IF NOT EXISTS RallyForge_partner_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES RallyForge_partners(id),
  event_type VARCHAR(100),
  metadata JSONB,
  occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS RallyForge_partner_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES RallyForge_partners(id),
  billing_provider_id VARCHAR(255),
  plan_code VARCHAR(100),
  status VARCHAR(50),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at TIMESTAMP,
  trial_end TIMESTAMP,
  amount_cents INT,
  currency VARCHAR(3)
);

-- ========== INDEXES ==========

CREATE INDEX idx_RallyForge_users_email ON RallyForge_users(email);
CREATE INDEX idx_RallyForge_budget_user ON RallyForge_budget_scenarios(user_id);
CREATE INDEX idx_RallyForge_retirement_user ON RallyForge_retirement_scenarios(user_id);
CREATE INDEX idx_RallyForge_transition_user ON RallyForge_transition_checklists(user_id);
CREATE INDEX idx_RallyForge_documents_user ON RallyForge_documents(user_id);
CREATE INDEX idx_RallyForge_job_postings_employer ON RallyForge_job_postings(employer_id);
CREATE INDEX idx_RallyForge_job_applications_match ON RallyForge_job_applications(match_score);
CREATE INDEX idx_RallyForge_state_benefits_state ON RallyForge_state_benefits(state_code);
CREATE INDEX idx_RallyForge_state_benefits_type ON RallyForge_state_benefits(benefit_type);
CREATE INDEX idx_RallyForge_federal_benefits_type ON RallyForge_federal_benefits(benefit_type);
CREATE INDEX idx_RallyForge_partners_category ON RallyForge_partners(category);
CREATE INDEX idx_RallyForge_partners_tier ON RallyForge_partners(tier);
CREATE INDEX idx_RallyForge_partners_status ON RallyForge_partners(status);
CREATE INDEX idx_RallyForge_partners_tags ON RallyForge_partners USING GIN(tags);
CREATE INDEX idx_RallyForge_partners_industries ON RallyForge_partners USING GIN(industries);
CREATE INDEX idx_RallyForge_partner_engagement_type_date ON RallyForge_partner_engagement(event_type, occurred_at);
CREATE INDEX idx_RallyForge_partner_billing_status ON RallyForge_partner_billing(status);
CREATE INDEX idx_RallyForge_claim_profiles_user ON RallyForge_claim_profiles(user_id);
CREATE INDEX idx_RallyForge_transition_profiles_user ON RallyForge_transition_profiles(user_id);
CREATE INDEX idx_RallyForge_financial_scenarios_user ON RallyForge_financial_scenarios(user_id);

-- Veteran-owned businesses directory
CREATE TABLE IF NOT EXISTS veteran_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  location VARCHAR(255),
  website VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(255),
  veteran_owner_name VARCHAR(255),
  service_branch VARCHAR(50),
  certifications TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Veteran nonprofits directory
CREATE TABLE IF NOT EXISTS veteran_nonprofits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  mission TEXT,
  ein VARCHAR(20) UNIQUE,
  website VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(255),
  headquarters_location VARCHAR(255),
  mission_areas TEXT[],
  donation_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User bookmarks (saves favorite pages, businesses, nonprofits)
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  page_id UUID REFERENCES public_pages(id),
  business_id UUID REFERENCES veteran_businesses(id),
  nonprofit_id UUID REFERENCES veteran_nonprofits(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT at_least_one_ref CHECK (
    (page_id IS NOT NULL)::integer +
    (business_id IS NOT NULL)::integer +
    (nonprofit_id IS NOT NULL)::integer = 1
  ),
  UNIQUE(user_id, page_id, business_id, nonprofit_id)
);

-- Moderation queue (tracks submissions awaiting review)
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES page_submissions(id),
  submission_type VARCHAR(50) NOT NULL,
  priority INT DEFAULT 0,
  assigned_to UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP
);

-- Keyword mappings (for scanning and discovery)
CREATE TABLE IF NOT EXISTS keyword_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== INDEXES ==========

-- Public pages indexes
CREATE INDEX IF NOT EXISTS idx_public_pages_platform ON public_pages(platform);
CREATE INDEX IF NOT EXISTS idx_public_pages_category ON public_pages(category);
CREATE INDEX IF NOT EXISTS idx_public_pages_status ON public_pages(status);
CREATE INDEX IF NOT EXISTS idx_public_pages_followers ON public_pages(followers_count DESC);

-- Page submissions indexes
CREATE INDEX IF NOT EXISTS idx_page_submissions_status ON page_submissions(status);
CREATE INDEX IF NOT EXISTS idx_page_submissions_user ON page_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_page_submissions_platform ON page_submissions(platform);

-- Veteran businesses indexes
CREATE INDEX IF NOT EXISTS idx_veteran_businesses_industry ON veteran_businesses(industry);
CREATE INDEX IF NOT EXISTS idx_veteran_businesses_location ON veteran_businesses(location);

-- Veteran nonprofits indexes
CREATE INDEX IF NOT EXISTS idx_veteran_nonprofits_mission ON veteran_nonprofits USING GIN(mission_areas);
CREATE INDEX IF NOT EXISTS idx_veteran_nonprofits_ein ON veteran_nonprofits(ein);

-- User bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_page ON user_bookmarks(page_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_business ON user_bookmarks(business_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_nonprofit ON user_bookmarks(nonprofit_id);

-- Moderation queue indexes
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_assigned ON moderation_queue(assigned_to);

-- Other table indexes
CREATE INDEX IF NOT EXISTS idx_budget_scenarios_user ON budget_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_retirement_scenarios_user ON retirement_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_transition_checklists_user ON transition_checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_builds_user ON resume_builds(user_id);
CREATE INDEX IF NOT EXISTS idx_veteran_job_profiles_user ON veteran_job_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_investment_accounts_user ON investment_accounts(user_id);

-- ============================================================================
-- PRICING & MONETIZATION TABLES
-- ============================================================================

-- Veteran Subscriptions (Free, Pro, Family, Lifetime)
CREATE TABLE IF NOT EXISTS RallyForge_veteran_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES RallyForge_users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('FREE', 'PRO', 'FAMILY', 'LIFETIME')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED')),
  start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT FALSE,
  payment_method VARCHAR(50),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Employer Accounts (Basic, Premium, Recruiting, Enterprise)
CREATE TABLE IF NOT EXISTS RallyForge_employer_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL UNIQUE,
  contact_phone VARCHAR(50),
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('BASIC', 'PREMIUM', 'RECRUITING', 'ENTERPRISE')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CANCELLED')),
  job_posts_used INT DEFAULT 0,
  job_posts_limit INT NOT NULL,
  applications_received INT DEFAULT 0,
  billing_cycle VARCHAR(20) DEFAULT 'MONTHLY',
  next_billing_date TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Posts (linked to employer accounts)
CREATE TABLE IF NOT EXISTS RallyForge_job_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES RallyForge_employer_accounts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  job_type VARCHAR(50),
  salary_min DECIMAL(12,2),
  salary_max DECIMAL(12,2),
  required_clearance VARCHAR(50),
  remote_options VARCHAR(50),
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'FILLED', 'EXPIRED')),
  views_count INT DEFAULT 0,
  applications_count INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Directory Listings (Basic, Featured, Premium, Advertising)
CREATE TABLE IF NOT EXISTS RallyForge_business_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL UNIQUE,
  contact_phone VARCHAR(50),
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('BASIC', 'FEATURED', 'PREMIUM', 'ADVERTISING')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CANCELLED')),
  category VARCHAR(100),
  description TEXT,
  address TEXT,
  website VARCHAR(500),
  veteran_owned BOOLEAN DEFAULT FALSE,
  logo_url VARCHAR(500),
  featured_until TIMESTAMP,
  views_count INT DEFAULT 0,
  clicks_count INT DEFAULT 0,
  billing_cycle VARCHAR(20) DEFAULT 'MONTHLY',
  next_billing_date TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead Generation Tracking
CREATE TABLE IF NOT EXISTS RallyForge_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('JOB_APPLICATION', 'BUSINESS_CONTACT', 'EMPLOYER_INQUIRY', 'OTHER')),
  source_id UUID,
  veteran_id UUID REFERENCES RallyForge_users(id),
  business_id UUID REFERENCES RallyForge_business_listings(id),
  employer_id UUID REFERENCES RallyForge_employer_accounts(id),
  lead_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST')),
  value DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VSO Partnership Tracking
CREATE TABLE IF NOT EXISTS RallyForge_vso_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL UNIQUE,
  contact_phone VARCHAR(50),
  partnership_type VARCHAR(50) CHECK (partnership_type IN ('REFERRAL', 'DATA_SHARING', 'CO_BRANDED', 'FULL')),
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED', 'TERMINATED')),
  referrals_sent INT DEFAULT 0,
  veterans_helped INT DEFAULT 0,
  revenue_share_percentage DECIMAL(5,2),
  agreement_start_date DATE,
  agreement_end_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices & Billing
CREATE TABLE IF NOT EXISTS RallyForge_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type VARCHAR(20) NOT NULL CHECK (customer_type IN ('VETERAN', 'EMPLOYER', 'BUSINESS', 'VSO')),
  customer_id UUID NOT NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED')),
  due_date DATE,
  paid_date TIMESTAMP,
  stripe_invoice_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment History
CREATE TABLE IF NOT EXISTS RallyForge_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES RallyForge_invoices(id) ON DELETE SET NULL,
  customer_type VARCHAR(20) NOT NULL,
  customer_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED')),
  stripe_payment_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Pricing Tables
CREATE INDEX IF NOT EXISTS idx_veteran_subscriptions_user ON RallyForge_veteran_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_veteran_subscriptions_tier ON RallyForge_veteran_subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_veteran_subscriptions_status ON RallyForge_veteran_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_employer_accounts_tier ON RallyForge_employer_accounts(tier);
CREATE INDEX IF NOT EXISTS idx_employer_accounts_status ON RallyForge_employer_accounts(status);
CREATE INDEX IF NOT EXISTS idx_employer_accounts_email ON RallyForge_employer_accounts(contact_email);

CREATE INDEX IF NOT EXISTS idx_job_posts_employer ON RallyForge_job_posts(employer_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_status ON RallyForge_job_posts(status);
CREATE INDEX IF NOT EXISTS idx_job_posts_featured ON RallyForge_job_posts(featured);

CREATE INDEX IF NOT EXISTS idx_business_listings_tier ON RallyForge_business_listings(tier);
CREATE INDEX IF NOT EXISTS idx_business_listings_status ON RallyForge_business_listings(status);
CREATE INDEX IF NOT EXISTS idx_business_listings_category ON RallyForge_business_listings(category);

CREATE INDEX IF NOT EXISTS idx_leads_veteran ON RallyForge_leads(veteran_id);
CREATE INDEX IF NOT EXISTS idx_leads_business ON RallyForge_leads(business_id);
CREATE INDEX IF NOT EXISTS idx_leads_employer ON RallyForge_leads(employer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON RallyForge_leads(status);

CREATE INDEX IF NOT EXISTS idx_vso_partners_status ON RallyForge_vso_partners(status);
CREATE INDEX IF NOT EXISTS idx_vso_partners_email ON RallyForge_vso_partners(contact_email);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON RallyForge_invoices(customer_type, customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON RallyForge_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON RallyForge_invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON RallyForge_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON RallyForge_payments(customer_type, customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON RallyForge_payments(status);


