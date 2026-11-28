# PROGRESS.md

## Project: InternBD - Internship Platform for Bangladesh

### Current State
- Next.js 15 app with Supabase, deployed on localhost:3000
- 28 pages generated in build
- Last e2e test: 34 of 39 passed (5 known failures)
- SHOW_SAMPLE_DATA=true locally

### Phases Status
| Phase | Status | Details |
|-------|--------|---------|
| Phase 1: Audit and fix everything | IN PROGRESS | Need to fix audit.mjs, fix 5 known e2e failures |
| Phase 2: Design improvements | PENDING | |
| Phase 3: Production hardening | PENDING | |
| Phase 4: Earning and growth features | PENDING | |
| Phase 5: Data quality and scraper | PENDING | |
| Phase 6: Deploy readiness | PENDING | |

### Known Issues to Fix (Phase 1)
1. **Department filter** - Test uses `filter-department-CSE` but data has "Software/IT", "Marketing", etc. Need to check actual department values
2. **Pagination** - `page-2` link may not exist if < 12 results; need to handle single page
3. **Full post→approve→delete flow** - Need to verify end-to-end works
4. **Admin logout** - Race condition between fetch and waitForURL
5. **Dark mode toggle** - Need to verify persistence works

### Files to Create
- scripts/audit.mjs - comprehensive audit (needs real link checking, button clicking)
- run-all.ps1 - already exists, needs audit step
- audit-report.md - output of audit
- scripts/shots.mjs - screenshots
- LOCAL.md - already exists

### Next Actions
1. Fix scripts/audit.mjs to actually work (real link checking, button clicking)
2. Start dev server detached, run audit
3. Fix all audit findings
4. Fix the 5 known e2e failures
5. Move to Phase 2
