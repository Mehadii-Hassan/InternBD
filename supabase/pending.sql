-- InternBD Pending Migration
-- Run this in: Supabase Dashboard > SQL Editor > Paste and Run
-- This file contains all pending schema changes that need to be applied.

-- ============================================================
-- 1. Add how_to_apply column to internships
-- ============================================================

ALTER TABLE public.internships
  ADD COLUMN IF NOT EXISTS how_to_apply TEXT;

-- ============================================================
-- 2. Add any future pending changes here
-- ============================================================
