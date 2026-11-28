# InternBD Deploy Guide

This document describes how to deploy InternBD to Vercel.

## Prerequisites

1. A Supabase project with the database schema applied
2. A Vercel account
3. GitHub account connected to Vercel

## Environment Variables

Add the following environment variables in your Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `sb_secret_...` |
| `ADMIN_PASSWORD` | Admin dashboard password | `your-secure-password` |

## Deployment Steps

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Import the project with the following settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Dev Command: `npm run dev`
   - Install Command: `npm install`
4. Add the environment variables listed above
5. Deploy

## Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor to create tables
3. Run `supabase/migration_votes.sql` in the SQL Editor to add migration tables
4. Run `supabase/pending.sql` in the SQL Editor to add Phase 4 tables
5. Seed sample data if desired (set `SHOW_SAMPLE_DATA=true` in .env.local)

## GitHub Actions

The scraper runs automatically via GitHub Actions at 00:00 UTC (06:00 Bangladesh time). Add the following secrets to your GitHub repository:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Local Development

1. Clone the repository
2. Run `npm install`
3. Create `.env.local` with the required environment variables
4. Run `supabase/pending.sql` in Supabase SQL Editor
5. Run `npm run dev`
6. Visit `http://localhost:3000`

## One-Command Verification

Run `.\run-all.ps1` to start the dev server, run E2E tests, take screenshots, run the audit, and verify database counts.
