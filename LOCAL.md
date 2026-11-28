# Local Development - InternBD

## One-Command Verification (Recommended)

Run everything from a single terminal:

```powershell
.\run-all.ps1
```

This script:
1. Records internship counts before tests
2. Starts the Next.js dev server in the background (`npm run dev`)
3. Waits for `http://localhost:3000` to respond (60s timeout)
4. Runs `node scripts/e2e.mjs` (E2E tests)
5. Runs `node scripts/shots.mjs` (screenshots)
6. Records counts again and verifies they match (no row leaks)
7. Always stops the dev server and child processes
8. Prints a final summary

Screenshots are saved to `./screenshots/` (gitignored).

## Two-Terminal Setup (Alternative)

**Terminal 1** — Start the dev server:
```
npm run dev
```
Wait until it prints `Ready in ...` and `Local: http://localhost:3000`.

**Terminal 2** — Run E2E tests:
```
node scripts/e2e.mjs
```

**Terminal 2** — Take screenshots (light/dark, desktop/mobile, saved to `/screenshots` which is gitignored):
```
node scripts/shots.mjs
```

Both scripts check that `http://localhost:3000` is reachable before running. If it is not, they print:
```
Start the server first: npm run dev (in another terminal), then run this again.
```
and exit.

## Available Pages

| Page | URL |
|------|-----|
| Home | / |
| Internships Listings | /internships |
| Internship Detail | /internship/[id] |
| Post an Internship | /post |
| Companies | /companies |
| Company Detail | /company/[slug] |
| Categories | /categories |
| Category Detail | /category/[slug] |
| Locations | /locations |
| Location Detail | /location/[slug] |
| About | /about |
| FAQ | /faq |
| Disclaimer | /disclaimer |
| Contact | /contact |
| Saved | /saved |
| Admin Login | /admin/login |
| Admin Dashboard | /admin/dashboard |
| Admin Moderation | /admin/moderate |
| Report Fake Listing | /report |
| Privacy | /privacy |
| Terms | /terms |
| Safety Tips | /safety-tips |
| For Employers | /for-employers |

## Environment

Required environment variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `ADMIN_PASSWORD` - Admin dashboard password

## Performance

Production build (`npm run build` then `npm run start`):
- Static pages (home, about, contact, etc.): ~100-250ms
- SSR pages (/internships, /companies): ~800-1500ms cold, faster when cached
- Detail pages (/internship/[id]): ~1200ms
