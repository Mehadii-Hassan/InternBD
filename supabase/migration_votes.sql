-- InternBD Migration: Votes, Removal Requests, Admin Actions
-- Run this in: Supabase Dashboard > SQL Editor > Paste and Run
-- This adds vote columns to internships and creates votes, removal_requests, admin_actions tables.

-- ============================================================
-- 1. Add vote columns to internships
-- ============================================================

ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS real_votes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fake_votes INTEGER DEFAULT 0;

-- ============================================================
-- 2. Create new tables
-- ============================================================

-- Votes (real/fake voting on internships)
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('real', 'fake')),
  reason TEXT,
  voter_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(internship_id, voter_hash)
);

-- Removal requests (companies or users requesting removal of a post)
CREATE TABLE IF NOT EXISTS public.removal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
  post_url TEXT NOT NULL,
  reason TEXT NOT NULL,
  requester_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin actions log
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_ip_hash TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_votes_internship_id ON public.votes(internship_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_hash ON public.votes(voter_hash);
CREATE INDEX IF NOT EXISTS idx_removal_requests_internship_id ON public.removal_requests(internship_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at);

-- ============================================================
-- 4. Grants
-- ============================================================

GRANT INSERT ON public.votes TO anon;
GRANT ALL ON public.votes TO service_role;

GRANT INSERT ON public.removal_requests TO anon;
GRANT ALL ON public.removal_requests TO service_role;

GRANT ALL ON public.admin_actions TO service_role;

-- ============================================================
-- 5. Row Level Security
-- ============================================================

-- Votes: public can insert votes, but NOT read them (voter_hash is sensitive)
-- anon can insert votes; aggregated counts are read from internships table (real_votes, fake_votes, trust_score)
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert votes" ON public.votes;
DROP POLICY IF EXISTS "Public can read vote summaries" ON public.votes;

CREATE POLICY "Public can insert votes"
  ON public.votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Removal requests: public can insert
ALTER TABLE public.removal_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert removal requests" ON public.removal_requests;

CREATE POLICY "Public can insert removal requests"
  ON public.removal_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin actions: service role only
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. Verification
-- ============================================================

SELECT tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('internships', 'companies', 'reports', 'votes', 'removal_requests', 'scrape_runs', 'scrape_sources', 'admin_actions')
ORDER BY tablename, policyname;
