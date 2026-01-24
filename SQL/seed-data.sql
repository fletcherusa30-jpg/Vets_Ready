-- Vets Ready Platform - Seed Data Script
-- This script was moved from the repository root to SQL/ to better reflect purpose.

-- Vets Ready Platform - Seed Data Script
-- This script populates the database with initial data for testing and demonstration

-- ============================================================================
-- FEDERAL BENEFITS (VA Benefits)
-- ============================================================================

INSERT INTO vetsready_federal_benefits (id, name, description, category, eligibility_summary, link, status)
VALUES
  -- Disability Benefits
  (gen_random_uuid(), 'VA Disability Compensation', 'Monthly payments for service-connected disabilities', 'Disability', 'Service-connected disability rated 10% or higher', 'https://www.va.gov/disability', 'active'),
  (gen_random_uuid(), 'Individual Unemployability (IU)', 'Benefits for 50%+ disabled unable to work', 'Disability', 'Rated at least 60% or 50% with ancillary condition', 'https://www.va.gov/disability/eligibility', 'active'),
  (gen_random_uuid(), 'Special Monthly Compensation (SMC)', 'Additional payment for severe disabilities', 'Disability', 'Specific service-connected disabilities qualifying for SMC', 'https://www.va.gov/disability', 'active'),

  -- Pension
  (gen_random_uuid(), 'VA Pension - Wartime Service', 'Monthly benefit for low-income wartime veterans', 'Pension', 'Served during wartime, age 65+ or disabled, limited income', 'https://www.va.gov/pension', 'active'),
  (gen_random_uuid(), 'Aid & Attendance (A&A)', 'Increased pension for housebound or caregiving needs', 'Pension', 'Wartime veteran needing regular aid and attendance', 'https://www.va.gov/pension', 'active'),

  -- Education
  (gen_random_uuid(), 'GI Bill - Post-9/11', 'Education benefits for post-9/11 active duty veterans', 'Education', 'Active duty post-9/11 or honorable discharge', 'https://www.va.gov/education/gi-bill', 'active'),
  (gen_random_uuid(), 'GI Bill - Montgomery', 'Education benefits for veterans who served before post-9/11', 'Education', 'Active duty service and elected deduction', 'https://www.va.gov/education/gi-bill', 'active'),
  (gen_random_uuid(), 'Vocational Rehabilitation & Employment', 'Training and job placement for service-connected disabled', 'Education', 'Service-connected disability rated 10% or higher', 'https://www.va.gov/employment/vocational-rehabilitation', 'active'),

  -- Healthcare
  (gen_random_uuid(), 'VA Healthcare System', 'Medical and dental care through VA hospitals and clinics', 'Healthcare', 'Honorable or general discharge', 'https://www.va.gov/health', 'active'),
  (gen_random_uuid(), 'CHAMPVA', 'Healthcare for spouses and dependents of disabled veterans', 'Healthcare', 'Eligible veteran sponsor', 'https://www.va.gov/champva', 'active'),
  (gen_random_uuid(), 'Agent Orange Health Effects', 'Healthcare for presumptive conditions from Agent Orange exposure', 'Healthcare', 'Service in Vietnam theater', 'https://www.va.gov/health/agent-orange', 'active'),

  -- Housing
  (gen_random_uuid(), 'VA Home Loan', 'Mortgages with favorable terms for veterans', 'Housing', 'Honorable service and credit-worthy', 'https://www.va.gov/housing', 'active'),
  (gen_random_uuid(), 'Specially Adapted Housing (SAH)', 'Grants for home modifications for severely disabled', 'Housing', 'Service-connected and meeting SAH criteria', 'https://www.va.gov/housing', 'active'),
  (gen_random_uuid(), 'Supportive Services for Veteran Families (SSVF)', 'Homelessness prevention and rapid rehousing', 'Housing', 'At risk of homelessness or homeless', 'https://www.va.gov/housing', 'active'),

  -- Life Insurance
  (gen_random_uuid(), 'Servicemembers Group Life Insurance (SGLI)', 'Life insurance during military service', 'Life Insurance', 'Active duty service member', 'https://www.va.gov/life-insurance', 'active'),
  (gen_random_uuid(), 'Veterans Group Life Insurance (VGLI)', 'Continuation of life insurance after service', 'Life Insurance', 'Had SGLI at separation', 'https://www.va.gov/life-insurance', 'active'),
  (gen_random_uuid(), 'Veterans Mortgage Life Insurance (VMLI)', 'Life insurance to cover home loan balance', 'Life Insurance', 'VA home loan holder with SAH', 'https://www.va.gov/life-insurance', 'active'),

  -- Burial
  (gen_random_uuid(), 'VA Burial Benefits', 'Headstone, gravesite, and flag for burial', 'Burial', 'Honorable discharge', 'https://www.va.gov/burial', 'active'),
  (gen_random_uuid(), 'Presidential Memorial Certificate', 'Certificate honoring deceased veterans', 'Burial', 'Honorable discharge', 'https://www.va.gov/burial', 'active');

-- ============================================================================
-- STATE BENEFITS (Sample for 5 states - expand to all 50)
-- ============================================================================

-- California
INSERT INTO vetsready_state_benefits (id, state, benefit_type, title, description, link, status)
VALUES
  (gen_random_uuid(), 'CA', 'Property Tax', 'CA Property Tax Exemption', '100% exemption for service-connected disabled (100% P&T)', 'https://www.taxes.ca.gov', 'active'),
  (gen_random_uuid(), 'CA', 'Education', 'CA Vet Fee Waiver', 'Fee waiver for California Community Colleges', 'https://www.cccapply.org', 'active'),
  (gen_random_uuid(), 'CA', 'Employment', 'CA Veterans Enterprise Program', 'Support for veteran-owned businesses', 'https://calvet.ca.gov', 'active'),
  (gen_random_uuid(), 'CA', 'Bonus', 'CA Vietnam Veteran Bonus', 'Bonus payment for Vietnam-era service', 'https://calvet.ca.gov', 'active');

-- Texas
INSERT INTO vetsready_state_benefits (id, state, benefit_type, title, description, link, status)
VALUES
  (gen_random_uuid(), 'TX', 'Property Tax', 'TX Homestead Exemption', 'Property tax exemption up to 100% for disabled veterans', 'https://comptroller.texas.gov', 'active'),
  (gen_random_uuid(), 'TX', 'Education', 'TX Hazlewood Act', 'Free tuition at TX public universities and colleges', 'https://www.tvc.texas.gov', 'active'),
  (gen_random_uuid(), 'TX', 'Occupational License', 'TX Professional License Waiver', 'License fee waiver for various professions', 'https://www.tvc.texas.gov', 'active');

-- Florida
INSERT INTO vetsready_state_benefits (id, state, benefit_type, title, description, link, status)
VALUES
  (gen_random_uuid(), 'FL', 'Property Tax', 'FL Property Tax Exemption', 'Up to $50,000 exemption for disabled veterans (100% P&T)', 'https://dor.myflorida.com', 'active'),
  (gen_random_uuid(), 'FL', 'Education', 'FL Bright Futures for Veterans', 'Educational scholarship for eligible Florida veterans', 'https://www.floridastudentfinancialaid.org', 'active'),
  (gen_random_uuid(), 'FL', 'License Plate', 'FL Veteran License Plate', 'Special license plate honoring veteran service', 'https://www.flhsmv.gov', 'active');

-- New York
INSERT INTO vetsready_state_benefits (id, state, benefit_type, title, description, link, status)
VALUES
  (gen_random_uuid(), 'NY', 'Tax', 'NY Veterans Tax Credit', 'Tax credit for military service', 'https://www.tax.ny.gov', 'active'),
  (gen_random_uuid(), 'NY', 'Education', 'NY Military Enhanced Recognition Incentive and Tribute (MERIT)', 'Scholarship for eligible veterans', 'https://www.hesc.ny.gov', 'active'),
  (gen_random_uuid(), 'NY', 'Housing', 'NY Housing for Veterans Program', 'Affordable housing program for veterans', 'https://veterans.ny.gov', 'active');

-- Pennsylvania
INSERT INTO vetsready_state_benefits (id, state, benefit_type, title, description, link, status)
VALUES
  (gen_random_uuid(), 'PA', 'Property Tax', 'PA Property Tax/Rent Rebate', 'Rebate for low-income seniors and disabled', 'https://www.revenue.pa.gov', 'active'),
  (gen_random_uuid(), 'PA', 'Education', 'PA Veterans Education Grant', 'Grant for PA veterans attending PA schools', 'https://veterans.pa.gov', 'active'),
  (gen_random_uuid(), 'PA', 'ID Card', 'PA FREE Veteran ID Card', 'Discount card for veteran shopping and services', 'https://veterans.pa.gov', 'active');

-- Note: To complete all 50 states, repeat the pattern above for:
-- AK, AZ, AR, CO, CT, DE, GA, HI, ID, IL, IN, IA, KS, KY, LA, ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, NC, ND, OH, OK, OR, RI, SC, SD, TN, UT, VT, VA, WA, WV, WI, WY

-- ============================================================================
-- SAMPLE PARTNERS
-- ============================================================================

INSERT INTO vetsready_partners (id, name, description, category, tier, link, status)
VALUES
  -- Employers
  (gen_random_uuid(), 'Google Veterans Program', 'Tech jobs for veterans with career development', 'employer', 'featured', 'https://careers.google.com/veterans', 'active'),
  (gen_random_uuid(), 'Microsoft TEALS Program', 'Teaching and mentoring opportunities for veterans', 'employer', 'featured', 'https://teals.org', 'active'),
  (gen_random_uuid(), 'Amazon Military Program', 'Job opportunities and veteran benefits', 'employer', 'basic', 'https://amazon.com/careers', 'active'),

  -- Veteran-Owned Businesses
  (gen_random_uuid(), 'Veterans Corner', 'Coffee shop owned and operated by veterans', 'business', 'basic', 'https://veteranscorner.com', 'active'),
  (gen_random_uuid(), 'Hire Heroes USA', 'Non-profit helping veterans with job placement', 'business', 'featured', 'https://hireheroesusa.org', 'active'),

  -- Sponsors
  (gen_random_uuid(), 'Mission VetsReady Foundation', 'Supporting veteran financial education', 'sponsor', 'premium', 'https://missionvetsready.org', 'active'),
  (gen_random_uuid(), 'Warriors2Wellness', 'Mental health and wellness program for vets', 'sponsor', 'featured', 'https://warriors2wellness.org', 'active'),

  -- Affiliates
  (gen_random_uuid(), 'Veteran Discount Network', 'Platform offering deals for veterans', 'affiliate', 'basic', 'https://veterandiscountnetwork.org', 'active'),
  (gen_random_uuid(), 'Operation Homefront', 'Emergency financial assistance for military families', 'affiliate', 'featured', 'https://operationhomefront.org', 'active');

-- ============================================================================
-- SAMPLE RESOURCES
-- ============================================================================

INSERT INTO vetsready_resources (id, title, description, category, link, resource_type, status)
VALUES
  -- Guides
  (gen_random_uuid(), 'Understanding VA Disability Ratings', 'Complete guide to how VA rates service-connected disabilities', 'Benefits', 'https://www.va.gov/disability', 'guide', 'active'),
  (gen_random_uuid(), 'VA Claims Process Step-by-Step', 'Detailed explanation of filing and appealing VA claims', 'Benefits', 'https://www.va.gov/disability', 'guide', 'active'),
  (gen_random_uuid(), 'Transitioning to Civilian Employment', 'Guide for veterans moving from military to civilian jobs', 'Employment', 'https://www.va.gov/employment', 'guide', 'active'),

  -- Forms
  (gen_random_uuid(), 'VA Form 21-526EZ: Application for Disability Compensation', 'Official form for applying for disability benefits', 'Benefits', 'https://www.va.gov/vaforms', 'form', 'active'),
  (gen_random_uuid(), 'VA Form 21-534: Application for Dependency and Indemnity Compensation', 'Form for survivor benefits', 'Benefits', 'https://www.va.gov/vaforms', 'form', 'active'),

  -- External
  (gen_random_uuid(), 'VA.gov Main Website', 'Official Department of Veterans Affairs website', 'General', 'https://www.va.gov', 'external', 'active'),
  (gen_random_uuid(), 'Veterans Benefits Administration', 'Official benefits portal and information', 'Benefits', 'https://www.benefits.va.gov', 'external', 'active'),
  (gen_random_uuid(), 'My HealtheVet', 'VA healthcare patient portal', 'Healthcare', 'https://www.myhealth.va.gov', 'external', 'active'),

  -- Tools
  (gen_random_uuid(), 'Disability Rating Calculator', 'Calculate estimated VA disability rating', 'Benefits', 'https://www.va.gov/disability', 'tool', 'active'),
  (gen_random_uuid(), 'GI Bill Calculator', 'Calculate education benefits', 'Education', 'https://www.va.gov/education', 'tool', 'active');

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- This seed script creates:
-- - 18 Federal Benefits (covering all major VA benefit categories)
-- - 18 State Benefits (5 sample states, expandable to 50)
-- - 9 Partners (employers, businesses, sponsors, affiliates)
-- - 10 Resources (guides, forms, external links, tools)

-- To run this script:
-- psql vetsready_platform -a -f SQL/seed-data.sql

-- To expand:
-- 1. Duplicate state benefits section for remaining 45 states
-- 2. Add more partners as they join the platform
-- 3. Add more resources as they become available

-- All records are set to 'active' status for immediate visibility in the app
-- Change status to 'inactive' to hide without deleting

COMMIT;
