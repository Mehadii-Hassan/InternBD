# Local Development - InternBD

## 3 Steps to View the Site in VS Code

1. **Run the dev task**: Press `Ctrl+Shift+P` > "Tasks: Run Task" > "Start InternBD" (or run `npm run dev` in terminal)
2. **Open Simple Browser**: Press `Ctrl+Shift+P` > "Simple Browser: Show" > enter `http://localhost:3000`
3. **Mobile view**: In Simple Browser, use the device toolbar or resize the window to test mobile layouts

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
