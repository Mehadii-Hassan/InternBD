-- InternBD RLS Tightening
-- Run this AFTER supabase/schema.sql in: Supabase Dashboard > SQL Editor > Paste and Run
-- This removes public read access to sensitive tables (reports, scrape_runs, scrape_sources).
-- Service role key (server-side only) bypasses RLS, so admin/scraper code can still read them.

-- ============================================================
-- Reports: remove public SELECT (contains ip_hash)
-- Keep INSERT policy so anyone can submit a report
-- ============================================================

DROP POLICY IF EXISTS "Public can read reports" ON reports;

-- ============================================================
-- Scrape runs: remove public SELECT
-- ============================================================

DROP POLICY IF EXISTS "Public can read scrape runs" ON scrape_runs;

-- ============================================================
-- Scrape sources: remove public SELECT
-- ============================================================

DROP POLICY IF EXISTS "Public can read scrape sources" ON scrape_sources;

-- ============================================================
-- Verify remaining policies
-- ============================================================

SELECT tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('internships', 'companies', 'reports', 'scrape_runs', 'scrape_sources')
ORDER BY tablename, policyname;
