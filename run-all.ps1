#!/usr/bin/env pwsh
# run-all.ps1 - One-command verification for InternBD
# Usage: .\run-all.ps1
# Records counts, starts dev server, runs e2e + screenshots, checks counts, stops server.

$ErrorActionPreference = "Continue"

Write-Host "`n=== InternBD One-Command Verification ===" -ForegroundColor Cyan
Write-Host ""

# Track overall result
$script:exitCode = 0

# --------------------------------------------------------------------
# Step 1: Record counts BEFORE tests
# --------------------------------------------------------------------
Write-Host "[1/8] Recording internship counts before tests..." -ForegroundColor Yellow
$beforeJson = node -e "
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^\"|\"$/g, '');
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
Promise.all([
  sb.from('internships').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
  sb.from('internships').select('*', { count: 'exact', head: true }),
]).then(([approved, total]) => {
  console.log(JSON.stringify({ approved: approved.count, total: total.count }));
}).catch(e => { console.error(e.message); process.exit(1); });
" 2>&1
$before = $beforeJson | ConvertFrom-Json -ErrorAction SilentlyContinue
Write-Host "  Before: approved=$($before.approved) total=$($before.total)" -ForegroundColor Green

# --------------------------------------------------------------------
# Step 2: Start dev server in background
# --------------------------------------------------------------------
Write-Host "[2/8] Starting Next.js dev server (background)..." -ForegroundColor Yellow
try {
  $serverProc = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WindowStyle Hidden -PassThru -ErrorAction Stop
} catch {
  Write-Host "  ERROR: Failed to start npm.cmd dev server" -ForegroundColor Red
  exit 1
}

# --------------------------------------------------------------------
# Step 3: Wait for server to respond
# --------------------------------------------------------------------
Write-Host "[3/8] Waiting for http://localhost:3000 (60s timeout)..." -ForegroundColor Yellow
$start = Get-Date
$ready = $false
while ((Get-Date) - $start -lt (New-TimeSpan -Seconds 60)) {
  try {
    $resp = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($resp.StatusCode -eq 200) { $ready = $true; break }
  } catch {}
  Start-Sleep -Seconds 2
}

if (-not $ready) {
  Write-Host "  ERROR: Server did not respond within 60 seconds" -ForegroundColor Red
  try { Stop-Process -Id $serverProc.Id -Force -ErrorAction SilentlyContinue } catch {}
  exit 1
}
Write-Host "  Server is ready" -ForegroundColor Green

# --------------------------------------------------------------------
# Step 4: Run E2E tests
# --------------------------------------------------------------------
Write-Host "[4/8] Running E2E tests..." -ForegroundColor Yellow
$e2eOutput = node scripts/e2e.mjs 2>&1
Write-Host $e2eOutput

# --------------------------------------------------------------------
# Step 5: Run screenshots
# --------------------------------------------------------------------
Write-Host "[5/8] Taking screenshots..." -ForegroundColor Yellow
$shotsOutput = node scripts/shots.mjs 2>&1
Write-Host $shotsOutput

# --------------------------------------------------------------------
# Step 6: Run audit
# --------------------------------------------------------------------
Write-Host "[6/8] Running audit..." -ForegroundColor Yellow
$auditOutput = node scripts/audit.mjs 2>&1
Write-Host $auditOutput

# --------------------------------------------------------------------
# Step 7: Record counts AFTER tests
# --------------------------------------------------------------------
Write-Host "[7/8] Recording internship counts after tests..." -ForegroundColor Yellow
$afterJson = node -e "
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^\"|\"$/g, '');
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
Promise.all([
  sb.from('internships').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
  sb.from('internships').select('*', { count: 'exact', head: true }),
]).then(([approved, total]) => {
  console.log(JSON.stringify({ approved: approved.count, total: total.count }));
}).catch(e => { console.error(e.message); process.exit(1); });
" 2>&1
$after = $afterJson | ConvertFrom-Json -ErrorAction SilentlyContinue
Write-Host "  After: approved=$($after.approved) total=$($after.total)" -ForegroundColor Green

# --------------------------------------------------------------------
# Step 8: Check counts match
# --------------------------------------------------------------------
$countsMatch = ($before.approved -eq $after.approved) -and ($before.total -eq $after.total)
if (-not $countsMatch) {
  Write-Host "  !! ROWS LEAKED !! Before: approved=$($before.approved) total=$($before.total), After: approved=$($after.approved) total=$($after.total)" -ForegroundColor Red
  $script:exitCode = 1
} else {
  Write-Host "  Counts match: approved=$($before.approved) total=$($before.total)" -ForegroundColor Green
}

# --------------------------------------------------------------------
# Step 9: Always stop the dev server
# --------------------------------------------------------------------
Write-Host "[9/9] Stopping dev server..." -ForegroundColor Yellow
try { Stop-Process -Id $serverProc.Id -Force -ErrorAction SilentlyContinue } catch {}
try { Get-Process node | Stop-Process -Force -ErrorAction SilentlyContinue } catch {}

# --------------------------------------------------------------------
# Final summary
# --------------------------------------------------------------------
Write-Host ""
Write-Host "=== FINAL SUMMARY ===" -ForegroundColor Cyan
$passedMatch = $e2eOutput -match "(\d+) passed"
$failedMatch = $e2eOutput -match "(\d+) failed"
$passed = if ($passedMatch) { $matches[1] } else { "?" }
$failed = if ($failedMatch) { $matches[1] } else { "?" }

# Parse audit totals
$auditCriticalMatch = $auditOutput -match "Critical: (\d+)"
$auditHighMatch = $auditOutput -match "High: (\d+)"
$auditMediumMatch = $auditOutput -match "Medium: (\d+)"
$auditCritical = if ($auditCriticalMatch) { $matches[1] } else { "?" }
$auditHigh = if ($auditHighMatch) { $matches[1] } else { "?" }
$auditMedium = if ($auditMediumMatch) { $matches[1] } else { "?" }

Write-Host "  E2E Tests: $passed passed, $failed failed"
Write-Host "  Audit: Critical=$auditCritical, High=$auditHigh, Medium=$auditMedium"
Write-Host "  Counts match: $countsMatch"
Write-Host "  Screenshots: ./screenshots/ (gitignored)"
if ($countsMatch -and $failed -eq 0 -and $auditCritical -eq 0 -and $auditHigh -eq 0) {
  Write-Host "  OVERALL: PASS" -ForegroundColor Green
} else {
  Write-Host "  OVERALL: FAIL" -ForegroundColor Red
  $script:exitCode = 1
}
Write-Host ""
exit $script:exitCode
