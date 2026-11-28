-- InternBD Phase 4: Earning and Growth Features
-- Run this in: Supabase Dashboard > SQL Editor > Paste and Run
-- All changes are idempotent (use IF NOT EXISTS where applicable)

-- ============================================================
-- 0. Add how_to_apply column to internships (from Phase 1 security fixes)
-- ============================================================
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS how_to_apply TEXT;

-- ============================================================
-- 1. Boost Requests table
-- Employers can request to boost/feature their internship
-- ============================================================
CREATE TABLE IF NOT EXISTS boost_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_email TEXT NOT NULL,
  amount INTEGER NOT NULL, -- amount in BDT
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, rejected
  payment_method TEXT, -- bkash, nagad
  payment_reference TEXT,
  featured_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boost_requests_internship_id ON boost_requests(internship_id);
CREATE INDEX IF NOT EXISTS idx_boost_requests_status ON boost_requests(status);

-- ============================================================
-- 2. Ad Slots table
-- Admin-managed banner slot for sponsored listings
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_slots_active ON ad_slots(is_active);

-- ============================================================
-- 3. Internship Views table
-- Track views and apply clicks per internship
-- ============================================================
CREATE TABLE IF NOT EXISTS internship_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  view_date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  apply_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(internship_id, view_date)
);

CREATE INDEX IF NOT EXISTS idx_internship_views_internship_id ON internship_views(internship_id);
CREATE INDEX IF NOT EXISTS idx_internship_views_date ON internship_views(view_date);

-- ============================================================
-- 4. Email Subscribers table
-- Job alert subscribers
-- ============================================================
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  category TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_active ON email_subscribers(is_active);

-- ============================================================
-- 5. Add featured column to internships
-- ============================================================
ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_internships_featured ON internships(is_featured);
