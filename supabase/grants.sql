-- InternBD Grants (safe version)
-- Run this in: Supabase Dashboard > SQL Editor > Paste and Run
-- Table-level privileges only. RLS policies (schema.sql / rls_tightening.sql)
-- control row-level access. anon must never get ALL privileges.

-- ============================================================
-- Internships: anon can SELECT (approved only via RLS), service_role ALL
-- ============================================================
GRANT SELECT ON public.internships TO anon;
GRANT ALL ON public.internships TO service_role;

-- ============================================================
-- Companies: anon/authenticated SELECT only, service_role ALL
-- ============================================================
GRANT SELECT ON public.companies TO anon;
GRANT SELECT ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;

-- ============================================================
-- Reports: anon INSERT only (anyone can report), service_role ALL
-- anon must NOT be able to read reports (contains ip_hash)
-- ============================================================
GRANT INSERT ON public.reports TO anon;
GRANT ALL ON public.reports TO service_role;

-- ============================================================
-- Scrape runs: service_role ONLY (no public access)
-- ============================================================
GRANT ALL ON public.scrape_runs TO service_role;

-- ============================================================
-- Scrape sources: service_role ONLY (no public access)
-- ============================================================
GRANT ALL ON public.scrape_sources TO service_role;

-- ============================================================
-- Sequences for identity/serial columns
-- ============================================================
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================
-- Verification queries
-- ============================================================

SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('internships', 'companies', 'reports', 'scrape_runs', 'scrape_sources')
ORDER BY table_name, grantee, privilege_type;
