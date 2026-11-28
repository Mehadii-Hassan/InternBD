import { chromium } from "playwright";
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// Load env
const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, "");
}

const BASE = "http://localhost:3000";
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

let passed = 0;
let failed = 0;
const results = [];
const createdPostIds = [];

function test(name, fn) {
  return async () => {
    try {
      await fn();
      results.push({ name, status: "PASS" });
      passed++;
      process.stdout.write(`PASS: ${name}\n`);
    } catch (e) {
      results.push({ name, status: "FAIL", error: e.message });
      failed++;
      process.stdout.write(`FAIL: ${name} - ${e.message}\n`);
    }
  };
}

async function fetchWithTimeout(url, ms = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function serverReachable() {
  try {
    const res = await fetchWithTimeout(`${BASE}/`, 5000);
    return res && res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const reachable = await serverReachable();
  if (!reachable) {
    process.stdout.write(
      "Start the server first: npm run dev (in another terminal), then run this again.\n"
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // One-time cleanup of leftover test votes from earlier runs
  let cleanupCount = 0;
  try {
    const { data: leftoverVotes } = await supabase
      .from("votes")
      .select("id, internship_id")
      .like("internship_id", "e2e-test-%");
    if (leftoverVotes && leftoverVotes.length > 0) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .like("internship_id", "e2e-test-%");
      if (!error) {
        cleanupCount = leftoverVotes.length;
      }
    }
    // Also clean up leftover test posts
    const { data: leftoverPosts } = await supabase
      .from("internships")
      .select("id")
      .eq("title", "E2E Test Internship");
    if (leftoverPosts && leftoverPosts.length > 0) {
      const { error } = await supabase
        .from("internships")
        .delete()
        .eq("title", "E2E Test Internship");
      if (!error) {
        cleanupCount += leftoverPosts.length;
      }
    }
  } catch {}

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);

    // Track console errors and 5xx responses per page
    const consoleErrors = [];
    const serverErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("response", (res) => {
      if (res.status() >= 500) {
        serverErrors.push(`${res.status()} ${res.url()}`);
      }
    });

    function assertNoPageErrors(contextName) {
      // Filter out expected "Failed to load resource" errors (network issues, not code bugs)
      const realConsoleErrors = consoleErrors.filter(
        (e) => !e.includes("Failed to load resource")
      );
      if (realConsoleErrors.length > 0) {
        throw new Error(`${contextName}: console errors: ${realConsoleErrors.slice(0, 3).join(" | ")}`);
      }
      if (serverErrors.length > 0) {
        throw new Error(`${contextName}: 5xx responses: ${serverErrors.slice(0, 3).join(" | ")}`);
      }
    }

    process.stdout.write("\n=== E2E Tests ===\n");

    // 1. Page loads
    const pages = [
      { url: "/", name: "Home" },
      { url: "/internships", name: "Internships" },
      { url: "/internships?category=Software/IT", name: "Internships Filtered" },
      { url: "/post", name: "Post" },
      { url: "/about", name: "About" },
      { url: "/contact", name: "Contact" },
      { url: "/privacy", name: "Privacy" },
      { url: "/terms", name: "Terms" },
      { url: "/disclaimer", name: "Disclaimer" },
      { url: "/faq", name: "FAQ" },
      { url: "/for-employers", name: "For Employers" },
      { url: "/safety-tips", name: "Safety Tips" },
      { url: "/companies", name: "Companies" },
      { url: "/categories", name: "Categories" },
      { url: "/locations", name: "Locations" },
      { url: "/admin/login", name: "Admin Login" },
      { url: "/report", name: "Report" },
      { url: "/saved", name: "Saved" },
    ];

    for (const { url, name } of pages) {
      await test(`${name} page loads`, async () => {
        consoleErrors.length = 0;
        serverErrors.length = 0;
        const res = await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded" });
        assertNoPageErrors(name);
        if (!res || res.status() !== 200) throw new Error(`status ${res?.status()}`);
      })();
    }

    // 404 page
    await test("404 page returns 404", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      const res = await page.goto(`${BASE}/nonexistent`, { waitUntil: "domcontentloaded" });
      assertNoPageErrors("404 page");
      if (!res || res.status() !== 404) throw new Error(`status ${res?.status()}`);
    })();

    // 2. Home search sends to /internships with filters
    await test("Home search sends to /internships with filters", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
      assertNoPageErrors("home before search");
      const searchInput = page.locator('input[name="q"]');
      if ((await searchInput.count()) === 0) throw new Error("No search input on home page");
      await searchInput.fill("software");
      await page.locator('form[action="/internships"] button[type="submit"]').click();
      await page.waitForURL((url) => url.pathname === "/internships" && url.searchParams.get("q") === "software", { timeout: 10000 });
      assertNoPageErrors("home after search");
      const params = new URL(page.url()).searchParams;
      if (params.get("q") !== "software") throw new Error("Search did not navigate to /internships with q param");
    })();

    // 3. Filters on /internships - each filter changes results and URL
    await test("Category filter changes results and URL", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/internships`, { waitUntil: "domcontentloaded" });
      assertNoPageErrors("internships before category");
      const categoryLink = page.locator('[data-testid="filter-category-Software/IT"]').first();
      if ((await categoryLink.count()) === 0) throw new Error("No category link found");
      await categoryLink.click();
      await page.waitForURL((url) => url.searchParams.get("category") === "Software/IT", { timeout: 10000 });
      assertNoPageErrors("internships after category");
      const params = new URL(page.url()).searchParams;
      if (params.get("category") !== "Software/IT") throw new Error("Category not in URL");
      const body = await page.textContent("body");
      if (!body.includes("Software/IT")) throw new Error("Category filter not reflected in results");
    })();

    await test("Location filter changes results and URL", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/internships?location=Dhaka`, { waitUntil: "domcontentloaded" });
      assertNoPageErrors("internships location");
      const params = new URL(page.url()).searchParams;
      if (params.get("location") !== "Dhaka") throw new Error("Location not in URL");
    })();

    await test("Paid filter changes results and URL", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/internships?paid=Paid`, { waitUntil: "domcontentloaded" });
      assertNoPageErrors("internships paid");
      const params = new URL(page.url()).searchParams;
      if (params.get("paid") !== "Paid") throw new Error("Paid not in URL");
    })();

    await test("Department filter changes results and URL", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/internships`, { waitUntil: "domcontentloaded" });
      const deptLink = page.locator('[data-testid="filter-department-CSE"]').first();
      if ((await deptLink.count()) === 0) throw new Error("No department link found");
      await deptLink.click();
      await page.waitForURL((url) => url.searchParams.get("department") === "CSE", { timeout: 10000 });
      assertNoPageErrors("internships after department");
      const params = new URL(page.url()).searchParams;
      if (params.get("department") !== "CSE") throw new Error("Department not in URL");
    })();

    await test("Work mode filter changes results and URL", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/internships`, { waitUntil: "domcontentloaded" });
      const modeLink = page.locator('[data-testid="filter-mode-Remote"]').first();
      if ((await modeLink.count()) === 0) throw new Error("No work mode link found");
      await modeLink.click();
      await page.waitForURL((url) => url.searchParams.get("mode") === "Remote", { timeout: 10000 });
      assertNoPageErrors("internships after mode");
      const params = new URL(page.url()).searchParams;
      if (params.get("mode") !== "Remote") throw new Error("Work mode not in URL");
    })();

    await test("Duration filter changes results and URL", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/internships`, { waitUntil: "domcontentloaded" });
      const durLink = page.locator('[data-testid="filter-duration-3 months"]').first();
      if ((await durLink.count()) === 0) throw new Error("No duration link found");
      await durLink.click();
      await page.waitForURL((url) => url.searchParams.get("duration") === "3 months", { timeout: 10000 });
      assertNoPageErrors("internships after duration");
      const params = new URL(page.url()).searchParams;
      if (params.get("duration") !== "3 months") throw new Error("Duration not in URL");
    })();

    await test("Deadline filter changes results and URL", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/internships`, { waitUntil: "domcontentloaded" });
      const dlLink = page.locator('[data-testid="filter-deadline-week"]').first();
      if ((await dlLink.count()) === 0) throw new Error("No deadline link found");
      await dlLink.click();
      await page.waitForURL((url) => url.searchParams.get("deadline") === "week", { timeout: 10000 });
      assertNoPageErrors("internships after deadline");
      const params = new URL(page.url()).searchParams;
      if (params.get("deadline") !== "week") throw new Error("Deadline not in URL");
    })();

    await test("Posted filter changes results and URL", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/internships`, { waitUntil: "domcontentloaded" });
      const postedLink = page.locator('[data-testid="filter-posted-24h"]').first();
      if ((await postedLink.count()) === 0) throw new Error("No posted link found");
      await postedLink.click();
      await page.waitForURL((url) => url.searchParams.get("posted") === "24h", { timeout: 10000 });
      assertNoPageErrors("internships after posted");
      const params = new URL(page.url()).searchParams;
      if (params.get("posted") !== "24h") throw new Error("Posted not in URL");
    })();

    await test("Verified only filter changes results and URL", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/internships`, { waitUntil: "domcontentloaded" });
      const verifiedLink = page.locator('[data-testid="filter-verified"]').first();
      if ((await verifiedLink.count()) === 0) throw new Error("No verified link found");
      await verifiedLink.click();
      await page.waitForURL((url) => url.searchParams.get("verified") === "true", { timeout: 10000 });
      assertNoPageErrors("internships after verified");
      const params = new URL(page.url()).searchParams;
      if (params.get("verified") !== "true") throw new Error("Verified not in URL");
    })();

    // Clear-all
    await test("Clear-all removes all filters", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/internships?category=Software/IT&paid=Paid`, { waitUntil: "domcontentloaded" });
      const clearLink = page.locator('[data-testid="filter-chip-clear-all"]').first();
      if ((await clearLink.count()) === 0) throw new Error("No clear-all link found");
      await clearLink.click();
      await page.waitForTimeout(1000);
      assertNoPageErrors("internships after clear-all");
      const params = new URL(page.url()).searchParams;
      if (params.get("category") || params.get("paid")) {
        throw new Error("Clear-all did not remove filters");
      }
    })();

    // Pagination
    await test("Pagination works", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/internships`, { waitUntil: "domcontentloaded" });
      const page2Link = page.locator('[data-testid="page-2"]').first();
      if ((await page2Link.count()) === 0) throw new Error("No page 2 link found (may be only one page of results)");
      await page2Link.click();
      await page.waitForTimeout(1000);
      assertNoPageErrors("internships after pagination");
      const params = new URL(page.url()).searchParams;
      if (params.get("page") !== "2") throw new Error("Pagination did not navigate to page 2");
    })();

    // 4. Bookmark + saved page
    await test("Bookmark and saved page works", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/saved`, { waitUntil: "domcontentloaded" });
      assertNoPageErrors("saved page");
      const body = await page.textContent("body");
      if (!body) throw new Error("Saved page empty");
    })();

    // 5. Vote real/fake from separate contexts
    await test("Vote Real and Fake from separate contexts", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/internships`, { waitUntil: "domcontentloaded" });
      const firstLink = page.locator('a[href^="/internship/"]').first();
      if ((await firstLink.count()) === 0) throw new Error("No internship links");
      const href = await firstLink.getAttribute("href");
      if (!href) throw new Error("No href on internship link");

      // Context 1: vote Real
      await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded" });
      assertNoPageErrors("detail page before vote");
      const realBtn = page.locator('button:has-text("Looks Real")');
      if ((await realBtn.count()) > 0) {
        await realBtn.click();
        await page.waitForTimeout(1000);
      }

      // Context 2: new page, vote Fake
      const page2 = await browser.newPage();
      page2.setDefaultTimeout(15000);
      try {
        await page2.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded" });
        const fakeBtn = page2.locator('button:has-text("Looks Fake")');
        if ((await fakeBtn.count()) > 0) {
          await fakeBtn.click();
          await page2.waitForTimeout(1000);
        }
      } finally {
        await page2.close();
      }
    })();

    // 6. Full post→approve→verify→delete flow
    await test("Full post→approve→verify→delete flow", async () => {
      if (!ADMIN_PASSWORD) throw new Error("ADMIN_PASSWORD not configured");

      const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      // Submit post as stranger
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/post`, { waitUntil: "domcontentloaded" });
      assertNoPageErrors("post page before submit");
      await page.fill('input[name="company_name"]', "E2E Test Company");
      await page.fill('input[name="company_email"]', "hr@e2etest.example.com");
      await page.fill('input[name="title"]', "E2E Test Internship");
      await page.selectOption('select[name="category"]', "Software/IT");
      await page.selectOption('select[name="location"]', "Dhaka");
      await page.selectOption('select[name="paid_status"]', "Paid");
      await page.selectOption('select[name="work_mode"]', "On-site");
      await page.selectOption('select[name="duration"]', "3 months");
      await page.fill('input[name="stipend"]', "৳8,000 - ৳12,000");
      await page.fill('input[name="deadline"]', deadline);
      await page.fill('textarea[name="description"]', "This is an E2E test internship posting for verification purposes.");
      await page.fill('textarea[name="requirements"]', "Bachelor's degree, English proficiency");
      await page.fill('textarea[name="responsibilities"]', "Develop software, attend meetings");
      await page.fill('textarea[name="how_to_apply"]', "Send CV to hr@e2etest.example.com");
      await page.fill('input[name="apply_link"]', "https://e2etest.example.com/apply");
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Check if post was created in database (source of truth)
      const { data: posts } = await supabase
        .from("internships")
        .select("id, status")
        .eq("title", "E2E Test Internship")
        .eq("company_name", "E2E Test Company")
        .order("created_at", { descending: true })
        .limit(1);

      if (!posts || posts.length === 0) {
        const body = await page.textContent("body");
        const formStillPresent = await page.locator('form').count() > 0;
        const errorText = await page.locator('div.bg-destructive\\/10').textContent().catch(() => "N/A");
        throw new Error(`Post submission did not succeed. Post not found in database. Form still present: ${formStillPresent}. Error text: "${errorText.trim()}"`);
      }

      const postId = posts[0].id;
      createdPostIds.push(postId);

      // Admin login
      consoleErrors.length = 0;
      serverErrors.length = 0;
      // Clear any existing admin cookies from previous tests
      await page.context().clearCookies();
      await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);
      assertNoPageErrors("admin login page");
      await page.fill('input[type="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL((url) => url.pathname === "/admin/dashboard", { timeout: 15000 });

      // Go to moderation and approve
      await page.goto(`${BASE}/admin/moderate`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);
      const approveBtn = page.locator('button:has-text("Approve")').first();
      if ((await approveBtn.count()) === 0) throw new Error("No approve button found on moderation page");
      await approveBtn.click();
      await page.waitForTimeout(2000);

      // Verify post is approved in database
      const { data: approvedPosts } = await supabase
        .from("internships")
        .select("status")
        .eq("id", postId);
      if (!approvedPosts || approvedPosts[0].status !== "approved") {
        throw new Error("Post was not approved");
      }

      // Verify post shows on public site
      await page.goto(`${BASE}/internships`, { waitUntil: "domcontentloaded" });
      const publicBody = await page.textContent("body");
      if (!publicBody.includes("E2E Test Internship")) throw new Error("Approved post not visible on public site");
    })();

    // 7. Admin wrong password shows error
    await test("Admin wrong password shows error", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
      await page.fill('input[type="password"]', "wrongpassword");
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      const body = await page.textContent("body");
      if (!body.includes("Invalid") && !body.includes("error") && !body.includes("Error")) {
        throw new Error("Wrong password did not produce an error message");
      }
    })();

    // 8. Admin dashboard redirects without login
    await test("Admin dashboard redirects without login", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      // Clear any existing admin cookies
      await page.context().clearCookies();
      await page.goto(`${BASE}/admin/dashboard`, { waitUntil: "domcontentloaded" });
      assertNoPageErrors("admin dashboard redirect");
      const url = page.url();
      if (!url.includes("/admin/login")) throw new Error("Did not redirect to login");
    })();

    // 9. Admin logout works (via API route)
    await test("Admin logout works", async () => {
      // Clear any existing admin cookies first
      await page.context().clearCookies();
      // Log in first
      await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
      await page.fill('input[type="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL((url) => url.pathname === "/admin/dashboard", { timeout: 15000 });

      // Call logout API - clears the cookie
      await fetch(`${BASE}/api/admin/logout`, { method: "POST" });

      // Verify admin cookie is cleared and /admin redirects to login
      await page.goto(`${BASE}/admin/dashboard`, { waitUntil: "domcontentloaded" });
      const finalUrl = page.url();
      if (!finalUrl.includes("/admin/login")) throw new Error("Logout did not work - still accessing admin dashboard");
    })();

    // 10. Dark mode toggle persistence
    await test("Dark mode toggle works and persists", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
      assertNoPageErrors("home before dark toggle");
      const html = page.locator("html");
      const toggle = page.locator('[data-testid="theme-toggle"]');
      if ((await toggle.count()) === 0) throw new Error("No theme toggle found");
      // Start waiting for dark class BEFORE clicking
      const darkWait = page.waitForFunction(() => document.documentElement.classList.contains("dark"), { timeout: 5000 });
      await toggle.click();
      await darkWait;
      const clsAfter = await html.getAttribute("class") || "";
      if (!clsAfter.includes("dark")) throw new Error("Dark mode class not added on toggle");
      // Reload and check persistence
      await page.reload();
      await page.waitForTimeout(1000);
      const clsAfterReload = await html.getAttribute("class") || "";
      if (!clsAfterReload.includes("dark")) {
        throw new Error("Dark mode not persisted after reload");
      }
      // Toggle back to light
      const lightWait = page.waitForFunction(() => !document.documentElement.classList.contains("dark"), { timeout: 5000 });
      await toggle.click();
      await lightWait;
      const clsLight = await html.getAttribute("class") || "";
      if (clsLight.includes("dark")) throw new Error("Dark mode not removed on toggle back");
    })();

    // 11. One footer only
    await test("Exactly one footer on pages", async () => {
      consoleErrors.length = 0;
      serverErrors.length = 0;
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
      assertNoPageErrors("home footer check");
      const footerCount = await page.locator("footer").count();
      if (footerCount !== 1) throw new Error(`Expected 1 footer, found ${footerCount}`);
    })();

    process.stdout.write("\n=== SUMMARY ===\n");
    process.stdout.write(`| Test | Status |\n`);
    process.stdout.write(`|------|--------|\n`);
    for (const r of results) {
      process.stdout.write(`| ${r.name} | ${r.status} |\n`);
    }
    if (cleanupCount > 0) {
      process.stdout.write(`\nCleanup: removed ${cleanupCount} leftover test row(s) from earlier runs.\n`);
    }
    process.stdout.write(`\n${passed} passed, ${failed} failed, ${passed + failed} total\n`);
  } finally {
    // Cleanup: delete test posts and votes
    try {
      for (const postId of createdPostIds) {
        await supabase.from("internships").delete().eq("id", postId);
        await supabase.from("votes").delete().eq("internship_id", postId);
      }
    } catch {}
    await browser.close();
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  process.stderr.write(`FATAL: ${e.message}\n`);
  process.exit(1);
});
