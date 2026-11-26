-- InternBD Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > Paste and Run

-- ============================================================
-- 1. ENUMS
-- ============================================================

CREATE TYPE internship_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE internship_source AS ENUM ('scraped', 'hr', 'manual');
CREATE TYPE work_mode AS ENUM ('On-site', 'Remote', 'Hybrid');
CREATE TYPE paid_status AS ENUM ('Paid', 'Unpaid');
CREATE TYPE duration_type AS ENUM ('1 month', '2 months', '3 months', '6 months', '12 months');

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  website TEXT,
  career_url TEXT,
  logo_url TEXT,
  is_trusted BOOLEAN DEFAULT FALSE,
  is_sample BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internships
CREATE TABLE internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_slug TEXT REFERENCES companies(slug) ON DELETE SET NULL,
  company_logo_url TEXT,
  company_email TEXT,
  category TEXT NOT NULL,
  department TEXT,
  location TEXT NOT NULL,
  division TEXT,
  work_mode work_mode NOT NULL,
  is_paid paid_status NOT NULL,
  stipend TEXT,
  duration duration_type NOT NULL,
  deadline DATE NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  apply_link TEXT,
  apply_email TEXT,
  source internship_source NOT NULL DEFAULT 'manual',
  source_name TEXT,
  source_url TEXT UNIQUE,
  status internship_status NOT NULL DEFAULT 'pending',
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_sample BOOLEAN DEFAULT FALSE,
  report_count INTEGER DEFAULT 0,
  trust_score INTEGER DEFAULT 0,
  scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports (fake reports)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scrape runs
CREATE TABLE scrape_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  source_name TEXT NOT NULL,
  found INTEGER DEFAULT 0,
  inserted INTEGER DEFAULT 0,
  skipped_duplicates INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scrape sources
CREATE TABLE scrape_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'website',
  is_active BOOLEAN DEFAULT TRUE,
  is_trusted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX idx_internships_category ON internships(category);
CREATE INDEX idx_internships_department ON internships(department);
CREATE INDEX idx_internships_location ON internships(location);
CREATE INDEX idx_internships_deadline ON internships(deadline);
CREATE INDEX idx_internships_created_at ON internships(created_at);
CREATE INDEX idx_internships_status ON internships(status);
CREATE INDEX idx_internships_source_url ON internships(source_url);
CREATE INDEX idx_internships_company_slug ON internships(company_slug);

-- Full-text search index on title + company + description
CREATE INDEX idx_internships_search ON internships USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(company_name, '') || ' ' || coalesce(description, ''))
);

CREATE INDEX idx_reports_internship_id ON reports(internship_id);
CREATE INDEX idx_scrape_runs_source_name ON scrape_runs(source_name);
CREATE INDEX idx_scrape_sources_is_active ON scrape_sources(is_active);

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

-- Internships: public can read approved rows only
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read approved internships"
  ON internships FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Only service role can insert/update/delete internships (server-side only)
-- anon/authenticated cannot insert internships directly (HR form goes through server route)

-- Companies: public can read all
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read companies"
  ON companies FOR SELECT
  TO anon, authenticated
  USING (true);

-- Reports: public can insert (anyone can report)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert reports"
  ON reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public can read reports (for admin, but really only service role should read)
CREATE POLICY "Public can read reports"
  ON reports FOR SELECT
  TO anon, authenticated
  USING (true);

-- Scrape runs: public can read
ALTER TABLE scrape_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read scrape runs"
  ON scrape_runs FOR SELECT
  TO anon, authenticated
  USING (true);

-- Scrape sources: public can read
ALTER TABLE scrape_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read scrape sources"
  ON scrape_sources FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- 5. SEED DATA: 30 Sample Internships (source = 'manual', is_sample = true)
-- ============================================================

-- First seed companies
INSERT INTO companies (name, slug, website, career_url, logo_url, is_trusted, is_sample) VALUES
  ('DevSoft Bangladesh', 'devsoft-bangladesh', 'https://devsoftbd.com', 'https://devsoftbd.com/careers', NULL, TRUE, TRUE),
  ('BrandBoost Ltd.', 'brandboost-ltd', 'https://brandboostbd.com', NULL, NULL, TRUE, TRUE),
  ('PixelCraft Studio', 'pixelcraft-studio', 'https://pixelcraftstudio.com', 'https://pixelcraftstudio.com/jobs', NULL, TRUE, TRUE),
  ('CapitalGrow Finance', 'capitalgrow-finance', 'https://capitalgrow.com', NULL, NULL, TRUE, TRUE),
  ('TalentBridge HR', 'talentbridge-hr', 'https://talentbridge.com', NULL, NULL, TRUE, TRUE),
  ('GrowBD Solutions', 'growbdsolutions', 'https://growbdsolutions.com', 'https://growbdsolutions.com/careers', NULL, TRUE, TRUE),
  ('InsightData BD', 'insightdata-bd', 'https://insightdata.com.bd', 'https://insightdata.com.bd/jobs', NULL, TRUE, TRUE),
  ('WordCraft Media', 'wordcraft-media', 'https://wordcraftmedia.com', NULL, NULL, TRUE, TRUE),
  ('BuildRight Construction', 'buildright-construction', 'https://buildrightbd.com', 'https://buildrightbd.com/careers', NULL, TRUE, TRUE),
  ('CodeCrafters BD', 'codecrafters-bd', 'https://codecrafters.com.bd', 'https://codecrafters.com.bd/jobs', NULL, TRUE, TRUE),
  ('VisualImpact Agency', 'visualimpact-agency', 'https://visualimpact.com', NULL, NULL, TRUE, TRUE),
  ('NeuroTech BD', 'neurotech-bd', 'https://neurotechbd.com', 'https://neurotechbd.com/careers', NULL, TRUE, TRUE),
  ('TrendSetter Media', 'trendsetter-media', 'https://trendsetterbd.com', NULL, NULL, TRUE, TRUE),
  ('LedgerPro Accounting', 'ledgerpro-accounting', 'https://ledgerpro.com.bd', 'https://ledgerpro.com.bd/jobs', NULL, TRUE, TRUE),
  ('HireRight BD', 'hireright-bd', 'https://hirerightbd.com', NULL, NULL, TRUE, TRUE),
  ('AgileFlow Solutions', 'agileflow-bd', 'https://agileflowbd.com', 'https://agileflowbd.com/careers', NULL, TRUE, TRUE),
  ('AdEcho Agency', 'adecho-agency', 'https://adecho.com', NULL, NULL, TRUE, TRUE),
  ('PowerGrid BD', 'powergrid-bd', 'https://powergridbd.com', 'https://powergridbd.com/careers', NULL, TRUE, TRUE),
  ('TechHub Bangladesh', 'techhub-bd', 'https://techhubbd.com', 'https://techhubbd.com/jobs', NULL, TRUE, TRUE),
  ('BrandLogic BD', 'brandlogic-bd', 'https://brandlogicbd.com', NULL, NULL, TRUE, TRUE),
  ('AppNinja BD', 'appninja-bd', 'https://appninja.com.bd', 'https://appninja.com.bd/careers', NULL, TRUE, TRUE),
  ('WealthWise BD', 'wealthwise-bd', 'https://wealthwisebd.com', 'https://wealthwisebd.com/jobs', NULL, TRUE, TRUE),
  ('DocuTech BD', 'docutech-bd', 'https://docutechbd.com', NULL, NULL, TRUE, TRUE),
  ('Machina Industries', 'machina-industries', 'https://machinaindustries.com', 'https://machinaindustries.com/careers', NULL, TRUE, TRUE),
  ('ProductLab BD', 'productlab-bd', 'https://productlabbd.com', 'https://productlabbd.com/jobs', NULL, TRUE, TRUE),
  ('CloudScale BD', 'cloudscale-bd', 'https://cloudscalebd.com', 'https://cloudscalebd.com/careers', NULL, TRUE, TRUE),
  ('RankUp Digital', 'rankup-digital', 'https://rankupdigital.com', NULL, NULL, TRUE, TRUE),
  ('FrameCraft Media', 'framecraft-bd', 'https://framecraftbd.com', NULL, NULL, TRUE, TRUE),
  ('LogiMove BD', 'logimove-bd', 'https://logimovebd.com', 'https://logimovebd.com/careers', NULL, TRUE, TRUE),
  ('SecureNet BD', 'securenet-bd', 'https://securenetbd.com', 'https://securenetbd.com/careers', NULL, TRUE, TRUE);

-- Seed internships
INSERT INTO internships (
  id, title, company_name, company_slug, company_logo_url, company_email,
  category, department, location, division, work_mode, is_paid, stipend, duration,
  deadline, description, requirements, responsibilities, apply_link, apply_email,
  source, source_name, source_url, status, is_verified, is_featured, is_sample,
  report_count, trust_score, scraped_at, created_at
) VALUES
  (gen_random_uuid(), 'Frontend Developer Intern', 'DevSoft Bangladesh', 'devsoft-bangladesh', NULL, NULL,
   'Software/IT', 'CSE', 'Dhaka', 'Dhaka', 'On-site', 'Paid', '৳8,000 - ৳12,000/month', '3 months',
   '2026-12-15', 'We are looking for a Frontend Developer Intern to join our team in Dhaka. You will work on building responsive web applications using React and Next.js.',
   ARRAY['Knowledge of HTML, CSS, JavaScript', 'Basic understanding of React', 'Familiarity with Tailwind CSS', 'Good communication skills'],
   ARRAY['Develop UI components using React', 'Collaborate with backend developers', 'Write clean, maintainable code', 'Participate in code reviews'],
   'https://devsoftbd.com/careers/frontend-intern', NULL,
   'manual', 'DevSoft Bangladesh', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Digital Marketing Intern', 'BrandBoost Ltd.', 'brandboost-ltd', NULL, 'hr@brandboostbd.com',
   'Marketing', 'Marketing', 'Chattogram', 'Chattogram', 'Hybrid', 'Paid', '৳6,000 - ৳10,000/month', '3 months',
   '2026-12-20', 'Join our marketing team in Chattogram to manage social media campaigns, SEO, and content strategy for our clients.',
   ARRAY['Understanding of social media platforms', 'Basic SEO knowledge', 'Creative writing skills', 'Familiarity with Canva'],
   ARRAY['Manage social media accounts', 'Create engaging content', 'Analyze campaign performance', 'Assist with email marketing'],
   NULL, 'hr@brandboostbd.com',
   'manual', 'BrandBoost Ltd.', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'UI/UX Design Intern', 'PixelCraft Studio', 'pixelcraft-studio', NULL, NULL,
   'Design', 'Design', 'Dhaka', 'Dhaka', 'On-site', 'Paid', '৳10,000 - ৳15,000/month', '6 months',
   '2026-12-10', 'PixelCraft Studio is seeking a creative UI/UX Design Intern to work on mobile and web app design projects.',
   ARRAY['Proficiency in Figma or Adobe XD', 'Understanding of user-centered design', 'Portfolio of design work', 'Knowledge of design systems'],
   ARRAY['Create wireframes and prototypes', 'Design user interfaces', 'Conduct user research', 'Collaborate with developers'],
   'https://pixelcraftstudio.com/jobs/uiux-intern', NULL,
   'manual', 'PixelCraft Studio', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Finance Analyst Intern', 'CapitalGrow Finance', 'capitalgrow-finance', NULL, 'careers@capitalgrow.com',
   'Finance', 'Finance', 'Dhaka', 'Dhaka', 'On-site', 'Paid', '৳12,000 - ৳18,000/month', '6 months',
   '2026-12-25', 'Finance Analyst Intern position at CapitalGrow Finance. Work on financial analysis, reporting, and budgeting for our corporate clients.',
   ARRAY["Bachelor's in Finance or Accounting", 'Advanced Excel skills', 'Understanding of financial statements', 'Attention to detail'],
   ARRAY['Prepare financial reports', 'Analyze budget variances', 'Assist with audits', 'Support finance team'],
   NULL, 'careers@capitalgrow.com',
   'manual', 'CapitalGrow Finance', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'HR Operations Intern', 'TalentBridge HR', 'talentbridge-hr', NULL, 'interns@talentbridge.com',
   'HR', 'HR', 'Remote', 'Remote', 'Remote', 'Unpaid', 'Unpaid', '3 months',
   '2026-12-30', 'Remote HR Operations Intern to assist with recruitment, onboarding, and employee engagement activities.',
   ARRAY['Interest in Human Resources', 'Good communication skills', 'Familiarity with HRIS tools', 'Organizational skills'],
   ARRAY['Screen resumes', 'Schedule interviews', 'Assist with onboarding', 'Maintain employee records'],
   NULL, 'interns@talentbridge.com',
   'manual', 'TalentBridge HR', NULL, 'approved', FALSE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Business Development Intern', 'GrowBD Solutions', 'growbdsolutions', NULL, NULL,
   'Business', 'BBA', 'Dhaka', 'Dhaka', 'On-site', 'Paid', '৳8,000 - ৳14,000/month', '3 months',
   '2026-12-18', 'Business Development Intern to help expand our client base and support sales initiatives across Bangladesh.',
   ARRAY['Strong communication skills', 'Understanding of sales process', 'Self-motivated', 'Willing to travel'],
   ARRAY['Generate leads', 'Support sales team', 'Prepare proposals', 'Client follow-ups'],
   'https://growbdsolutions.com/careers/bd-intern', NULL,
   'manual', 'GrowBD Solutions', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Data Analyst Intern', 'InsightData BD', 'insightdata-bd', NULL, NULL,
   'Data/AI', 'CSE', 'Dhaka', 'Dhaka', 'Hybrid', 'Paid', '৳15,000 - ৳20,000/month', '6 months',
   '2026-12-12', 'Data Analyst Intern to work with large datasets, create dashboards, and provide business insights using Python and SQL.',
   ARRAY['Python programming', 'SQL knowledge', 'Statistics basics', 'Data visualization tools'],
   ARRAY['Clean and analyze data', 'Create dashboards', 'Generate reports', 'Present insights to team'],
   'https://insightdata.com.bd/jobs/data-intern', NULL,
   'manual', 'InsightData BD', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Content Writing Intern', 'WordCraft Media', 'wordcraft-media', NULL, NULL,
   'Content Writing', 'English', 'Remote', 'Remote', 'Remote', 'Paid', '৳5,000 - ৳8,000/month', '3 months',
   '2026-12-05', 'Content Writing Intern to create blog posts, articles, and social media content for our clients worldwide.',
   ARRAY['Excellent English writing skills', 'Creative thinking', 'Basic SEO knowledge', 'Ability to meet deadlines'],
   ARRAY['Write blog posts and articles', 'Create social media content', 'Edit and proofread content', 'Research topics'],
   NULL, NULL,
   'manual', 'WordCraft Media', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Civil Engineering Intern', 'BuildRight Construction', 'buildright-construction', NULL, NULL,
   'Engineering', 'Civil', 'Chattogram', 'Chattogram', 'On-site', 'Paid', '৳9,000 - ৳13,000/month', '6 months',
   '2026-12-28', 'Civil Engineering Intern for our construction projects in Chattogram. Work on-site with experienced engineers.',
   ARRAY['Civil Engineering degree student', 'AutoCAD knowledge', 'Understanding of construction basics', 'Willing to work on-site'],
   ARRAY['Site supervision', 'AutoCAD drafting', 'Material testing', 'Progress reporting'],
   'https://buildrightbd.com/careers/civil-intern', NULL,
   'manual', 'BuildRight Construction', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Backend Developer Intern', 'CodeCrafters BD', 'codecrafters-bd', NULL, NULL,
   'Software/IT', 'CSE', 'Dhaka', 'Dhaka', 'On-site', 'Paid', '৳10,000 - ৳15,000/month', '3 months',
   '2026-12-22', 'Backend Developer Intern to build REST APIs and server-side applications using Node.js and PostgreSQL.',
   ARRAY['JavaScript/TypeScript', 'Node.js basics', 'Database fundamentals', 'Git version control'],
   ARRAY['Build REST APIs', 'Database design', 'Write unit tests', 'Debug and optimize code'],
   'https://codecrafters.com.bd/jobs/backend-intern', NULL,
   'manual', 'CodeCrafters BD', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Graphic Design Intern', 'VisualImpact Agency', 'visualimpact-agency', NULL, NULL,
   'Design', 'Design', 'Dhaka', 'Dhaka', 'On-site', 'Unpaid', 'Unpaid', '3 months',
   '2026-12-14', 'Graphic Design Intern to create visual content for branding, social media, and marketing campaigns.',
   ARRAY['Adobe Photoshop/Illustrator', 'Creativity and design sense', 'Portfolio work', 'Attention to detail'],
   ARRAY['Create social media graphics', 'Design marketing materials', 'Edit photos', 'Brand identity work'],
   NULL, NULL,
   'manual', 'VisualImpact Agency', NULL, 'approved', FALSE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'AI/ML Intern', 'NeuroTech BD', 'neurotech-bd', NULL, NULL,
   'Data/AI', 'CSE', 'Remote', 'Remote', 'Remote', 'Paid', '৳20,000 - ৳30,000/month', '6 months',
   '2026-12-16', 'AI/ML Intern to work on machine learning models, natural language processing, and computer vision projects.',
   ARRAY['Python programming', 'Machine learning basics', 'TensorFlow or PyTorch', 'Mathematics background'],
   ARRAY['Train ML models', 'Data preprocessing', 'Model evaluation', 'Research papers'],
   'https://neurotechbd.com/careers/ml-intern', NULL,
   'manual', 'NeuroTech BD', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Social Media Intern', 'TrendSetter Media', 'trendsetter-media', NULL, NULL,
   'Marketing', 'Marketing', 'Dhaka', 'Dhaka', 'Hybrid', 'Paid', '৳6,000 - ৳9,000/month', '3 months',
   '2026-12-11', 'Social Media Intern to manage Facebook, Instagram, and TikTok accounts for our brands.',
   ARRAY['Social media savvy', 'Content creation skills', 'Basic video editing', 'Trend awareness'],
   ARRAY['Create social posts', 'Engage with followers', 'Monitor trends', 'Schedule content'],
   NULL, NULL,
   'manual', 'TrendSetter Media', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Accounting Intern', 'LedgerPro Accounting', 'ledgerpro-accounting', NULL, NULL,
   'Finance', 'Accounting', 'Sylhet', 'Sylhet', 'On-site', 'Paid', '৳7,000 - ৳11,000/month', '3 months',
   '2026-12-19', 'Accounting Intern to assist with bookkeeping, tax preparation, and financial record maintenance.',
   ARRAY['Accounting degree student', 'Tally or QuickBooks', 'Excel skills', 'Attention to detail'],
   ARRAY['Bookkeeping', 'Invoice processing', 'Bank reconciliation', 'Tax document preparation'],
   'https://ledgerpro.com.bd/jobs/accounting-intern', NULL,
   'manual', 'LedgerPro Accounting', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Recruitment Intern', 'HireRight BD', 'hireright-bd', NULL, NULL,
   'HR', 'BBA', 'Remote', 'Remote', 'Remote', 'Unpaid', 'Unpaid', '2 months',
   '2026-12-08', 'Recruitment Intern to support talent acquisition, candidate sourcing, and interview coordination.',
   ARRAY['Interest in recruiting', 'Communication skills', 'LinkedIn familiarity', 'Organized'],
   ARRAY['Source candidates', 'Screen applications', 'Schedule interviews', 'Update ATS'],
   NULL, NULL,
   'manual', 'HireRight BD', NULL, 'approved', FALSE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Project Management Intern', 'AgileFlow Solutions', 'agileflow-bd', NULL, NULL,
   'Business', 'BBA', 'Dhaka', 'Dhaka', 'Hybrid', 'Paid', '৳11,000 - ৳16,000/month', '6 months',
   '2026-12-24', 'Project Management Intern to assist project managers with planning, tracking, and delivery of client projects.',
   ARRAY['Business or Engineering degree', 'Jira or Trello', 'Communication skills', 'Time management'],
   ARRAY['Track project progress', 'Update documentation', 'Coordinate team meetings', 'Risk monitoring'],
   'https://agileflowbd.com/careers/pm-intern', NULL,
   'manual', 'AgileFlow Solutions', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Copywriter Intern', 'AdEcho Agency', 'adecho-agency', NULL, NULL,
   'Content Writing', 'English', 'Dhaka', 'Dhaka', 'On-site', 'Paid', '৳6,500 - ৳10,000/month', '3 months',
   '2026-12-09', 'Copywriter Intern to write ad copy, email campaigns, and website content for advertising clients.',
   ARRAY['Strong copywriting skills', 'Creative mindset', 'English proficiency', 'Deadline oriented'],
   ARRAY['Write ad copy', 'Create email campaigns', 'Website content', 'Brand messaging'],
   NULL, NULL,
   'manual', 'AdEcho Agency', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Electrical Engineering Intern', 'PowerGrid BD', 'powergrid-bd', NULL, NULL,
   'Engineering', 'EEE', 'Khulna', 'Khulna', 'On-site', 'Paid', '৳10,000 - ৳14,000/month', '6 months',
   '2026-12-26', 'Electrical Engineering Intern for power distribution and substation projects in Khulna.',
   ARRAY['Electrical Engineering student', 'AutoCAD Electrical', 'Understanding of power systems', 'Safety awareness'],
   ARRAY['Site surveys', 'Electrical drawings', 'Equipment testing', 'Report preparation'],
   'https://powergridbd.com/careers/ee-intern', NULL,
   'manual', 'PowerGrid BD', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Full Stack Developer Intern', 'TechHub Bangladesh', 'techhub-bd', NULL, NULL,
   'Software/IT', 'CSE', 'Dhaka', 'Dhaka', 'Hybrid', 'Paid', '৳12,000 - ৳18,000/month', '3 months',
   '2026-12-20', 'Full Stack Developer Intern to work on end-to-end web applications using the MERN stack.',
   ARRAY['JavaScript/TypeScript', 'React or Next.js', 'Node.js', 'MongoDB or PostgreSQL'],
   ARRAY['Develop full-stack features', 'API integration', 'Database work', 'Testing and deployment'],
   'https://techhubbd.com/jobs/fullstack-intern', NULL,
   'manual', 'TechHub Bangladesh', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Brand Strategy Intern', 'BrandLogic BD', 'brandlogic-bd', NULL, NULL,
   'Marketing', 'BBA', 'Dhaka', 'Dhaka', 'Remote', 'Unpaid', 'Unpaid', '3 months',
   '2026-12-13', 'Brand Strategy Intern to assist with brand positioning, market research, and campaign planning.',
   ARRAY['Marketing or Business degree', 'Research skills', 'Creative thinking', 'Presentation skills'],
   ARRAY['Market research', 'Brand audits', 'Strategy decks', 'Campaign support'],
   NULL, NULL,
   'manual', 'BrandLogic BD', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Mobile App Developer Intern', 'AppNinja BD', 'appninja-bd', NULL, NULL,
   'Software/IT', 'CSE', 'Dhaka', 'Dhaka', 'On-site', 'Paid', '৳13,000 - ৳19,000/month', '6 months',
   '2026-12-17', 'Mobile App Developer Intern to build iOS and Android applications using React Native or Flutter.',
   ARRAY['JavaScript or Dart', 'React Native or Flutter', 'Mobile UI/UX', 'Git version control'],
   ARRAY['Build mobile features', 'API integration', 'App testing', 'Play Store/App Store deployment'],
   'https://appninja.com.bd/careers/mobile-intern', NULL,
   'manual', 'AppNinja BD', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Financial Planning Intern', 'WealthWise BD', 'wealthwise-bd', NULL, NULL,
   'Finance', 'Finance', 'Dhaka', 'Dhaka', 'On-site', 'Paid', '৳9,000 - ৳13,000/month', '3 months',
   '2026-12-21', 'Financial Planning Intern to assist with client portfolios, investment analysis, and financial plans.',
   ARRAY['Finance degree student', 'Excel proficiency', 'Investment basics', 'Client communication'],
   ARRAY['Portfolio analysis', 'Client meetings support', 'Financial plans', 'Market research'],
   'https://wealthwisebd.com/jobs/fp-intern', NULL,
   'manual', 'WealthWise BD', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Technical Writer Intern', 'DocuTech BD', 'docutech-bd', NULL, NULL,
   'Content Writing', 'English', 'Remote', 'Remote', 'Remote', 'Paid', '৳7,000 - ৳11,000/month', '3 months',
   '2026-12-07', 'Technical Writer Intern to create documentation, user guides, and API documentation for software products.',
   ARRAY['Technical writing skills', 'Software understanding', 'Markdown knowledge', 'Clarity in writing'],
   ARRAY['Write user guides', 'Create API docs', 'Edit documentation', 'Maintain knowledge base'],
   NULL, NULL,
   'manual', 'DocuTech BD', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Mechanical Engineering Intern', 'Machina Industries', 'machina-industries', NULL, NULL,
   'Engineering', 'Mechanical', 'Chattogram', 'Chattogram', 'On-site', 'Paid', '৳8,500 - ৳12,500/month', '6 months',
   '2026-12-29', 'Mechanical Engineering Intern for manufacturing and machinery projects in Chattogram.',
   ARRAY['Mechanical Engineering student', 'SolidWorks or AutoCAD', 'Manufacturing basics', 'Safety protocols'],
   ARRAY['Machine design', 'Manufacturing support', 'Quality checks', 'Technical drawings'],
   'https://machinaindustries.com/careers/me-intern', NULL,
   'manual', 'Machina Industries', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Product Management Intern', 'ProductLab BD', 'productlab-bd', NULL, NULL,
   'Business', 'BBA', 'Dhaka', 'Dhaka', 'Hybrid', 'Paid', '৳12,000 - ৳17,000/month', '6 months',
   '2026-12-15', 'Product Management Intern to assist with product strategy, user research, and feature planning.',
   ARRAY['Business or CS degree', 'Analytical skills', 'User research', 'Product sense'],
   ARRAY['User interviews', 'Feature specifications', 'Product roadmap support', 'Competitive analysis'],
   'https://productlabbd.com/jobs/pm-intern', NULL,
   'manual', 'ProductLab BD', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'DevOps Intern', 'CloudScale BD', 'cloudscale-bd', NULL, NULL,
   'Software/IT', 'CSE', 'Remote', 'Remote', 'Remote', 'Paid', '৳15,000 - ৳22,000/month', '3 months',
   '2026-12-18', 'DevOps Intern to work on CI/CD pipelines, cloud infrastructure, and deployment automation.',
   ARRAY['Linux basics', 'Docker or Kubernetes', 'AWS or Azure', 'Git and scripting'],
   ARRAY['CI/CD pipelines', 'Infrastructure as code', 'Monitoring setup', 'Deployment support'],
   'https://cloudscalebd.com/careers/devops-intern', NULL,
   'manual', 'CloudScale BD', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'SEO Intern', 'RankUp Digital', 'rankup-digital', NULL, NULL,
   'Marketing', 'Marketing', 'Dhaka', 'Dhaka', 'On-site', 'Paid', '৳6,000 - ৳9,000/month', '3 months',
   '2026-12-10', 'SEO Intern to work on keyword research, on-page optimization, and link building for client websites.',
   ARRAY['SEO fundamentals', 'Google Analytics', 'Content writing', 'Analytical thinking'],
   ARRAY['Keyword research', 'On-page SEO', 'Link building', 'SEO reporting'],
   NULL, NULL,
   'manual', 'RankUp Digital', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Video Editor Intern', 'FrameCraft Media', 'framecraft-bd', NULL, NULL,
   'Content Writing', 'Media', 'Dhaka', 'Dhaka', 'On-site', 'Paid', '৳7,500 - ৳11,500/month', '3 months',
   '2026-12-12', 'Video Editor Intern to edit promotional videos, reels, and content for social media and YouTube.',
   ARRAY['Premiere Pro or Final Cut', 'After Effects basics', 'Storytelling sense', 'Deadline oriented'],
   ARRAY['Edit videos', 'Create reels', 'Add effects and transitions', 'Export for platforms'],
   NULL, NULL,
   'manual', 'FrameCraft Media', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Supply Chain Intern', 'LogiMove BD', 'logimove-bd', NULL, NULL,
   'Business', 'BBA', 'Chattogram', 'Chattogram', 'On-site', 'Paid', '৳8,000 - ৳12,000/month', '6 months',
   '2026-12-27', 'Supply Chain Intern to assist with logistics, inventory management, and shipment tracking.',
   ARRAY['Supply chain or Business degree', 'Excel proficiency', 'Logistics understanding', 'Organized'],
   ARRAY['Shipment tracking', 'Inventory updates', 'Vendor coordination', 'Reports'],
   'https://logimovebd.com/careers/sc-intern', NULL,
   'manual', 'LogiMove BD', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW()),

  (gen_random_uuid(), 'Cybersecurity Intern', 'SecureNet BD', 'securenet-bd', NULL, NULL,
   'Software/IT', 'CSE', 'Dhaka', 'Dhaka', 'Hybrid', 'Paid', '৳14,000 - ৳20,000/month', '6 months',
   '2026-12-23', 'Cybersecurity Intern to assist with vulnerability assessment, security monitoring, and incident response.',
   ARRAY['Network security basics', 'Linux command line', 'Security tools', 'Problem solving'],
   ARRAY['Security monitoring', 'Vulnerability scanning', 'Incident response support', 'Security audits'],
   'https://securenetbd.com/careers/cyber-intern', NULL,
   'manual', 'SecureNet BD', NULL, 'approved', TRUE, FALSE, TRUE,
   0, 0, NOW(), NOW());