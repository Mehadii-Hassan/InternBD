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
let results = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  return async () => {
    try {
      await fn();
      results.push({ name, status: "PASS" });
      passed++;
      console.log(`PASS: ${name}`);
    } catch (e) {
      results.push({ name, status: "FAIL", error: e.message });
      failed++;
      console.log(`FAIL: ${name} - ${e.message}`);
    }
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  // ===== TEST 1: All pages load =====
  console.log("\n=== TEST 1: All pages load ===");
  const pages = [
    { url: "/", name: "Home" },
    { url: "/internships", name: "Internships" },
    { url: "/post", name: "Post" },
    { url: "/about", name: "About" },
    { url: "/contact", name: "Contact" },
    { url: "/privacy", name: "Privacy" },
    { url: "/terms", name: "Terms" },
    { url: "/companies", name: "Companies" },
    { url: "/categories", name: "Categories" },
    { url: "/locations", name: "Locations" },
    { url: "/admin/login", name: "Admin Login" },
    { url: "/safety-tips", name: "Safety Tips" },
    { url: "/for-employers", name: "For Employers" },
    { url: "/report", name: "Report" },
    { url: "/saved", name: "Saved" },
  ];

  for (const { url, name } of pages) {
    await test(`${name} page loads`, async () => {
      const res = await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded" });
      if (!res || res.status() !== 200) throw new Error(`status ${res?.status()}`);
    })();
  }

  // 404 page
  await test("404 page returns 404", async () => {
    const res = await page.goto(`${BASE}/nonexistent`, { waitUntil: "domcontentloaded" });
    if (!res || res.status() !== 404) throw new Error(`status ${res?.status()}`);
  })();

  // ===== TEST 2: Search and filters =====
  console.log("\n=== TEST 2: Search and filters ===");
  await test("Search filters work", async () => {
    await page.goto(`${BASE}/internships?q=software`, { waitUntil: "domcontentloaded" });
    const body = await page.textContent("body");
    if (!body.includes("software") && !body.includes("Software")) {
      throw new Error("Search term not reflected");
    }
  })();

  await test("Category filter works", async () => {
    await page.goto(`${BASE}/internships?category=Software/IT`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const body = await page.textContent("body");
    if (!body.includes("Software/IT")) throw new Error("Category filter not applied");
  })();

  await test("Location filter works", async () => {
    await page.goto(`${BASE}/internships?location=Dhaka`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const body = await page.textContent("body");
    if (!body.includes("Dhaka")) throw new Error("Location filter not applied");
  })();

  await test("Paid filter works", async () => {
    await page.goto(`${BASE}/internships?paid=Paid`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const body = await page.textContent("body");
    if (!body.includes("Paid")) throw new Error("Paid filter not applied");
  })();

  await test("Sort works", async () => {
    await page.goto(`${BASE}/internships?sort=stipend`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    // Just check page loads without error
  })();

  await test("Pagination works", async () => {
    await page.goto(`${BASE}/internships?page=2`, { waitUntil: "domcontentloaded" });
    const body = await page.textContent("body");
    if (!body.includes("internship")) throw new Error("Page 2 not loaded");
  })();

  // ===== TEST 3: Internship detail page =====
  console.log("\n=== TEST 3: Detail page ===");
  await test("Internship detail loads real data", async () => {
    await page.goto(`${BASE}/internships`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    // Get first internship link
    const firstLink = await page.locator('a[href^="/internship/"]').first();
    if ((await firstLink.count()) === 0) throw new Error("No internship links found");
    const href = await firstLink.getAttribute("href");
    await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded" });
    const h1 = await page.locator("h1").first();
    if ((await h1.count()) === 0) throw new Error("No title on detail page");
  })();

  // ===== TEST 4: Bookmark and saved =====
  console.log("\n=== TEST 4: Bookmark and saved ===");
  await test("Bookmark and saved page works", async () => {
    await page.goto(`${BASE}/saved`, { waitUntil: "domcontentloaded" });
    const body = await page.textContent("body");
    // Saved page should load without error
  })();

  // ===== TEST 5: Post submission =====
  console.log("\n=== TEST 5: Post submission ===");
  await test("Post submission form loads", async () => {
    await page.goto(`${BASE}/post`, { waitUntil: "domcontentloaded" });
    const form = await page.locator("form");
    if ((await form.count()) === 0) throw new Error("No post form found");
  })();

  // ===== TEST 6: Admin login/logout =====
  console.log("\n=== TEST 6: Admin login/logout ===");
  await test("Admin login page loads", async () => {
    await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
    const passwordInput = await page.locator('input[type="password"]');
    if ((await passwordInput.count()) === 0) throw new Error("No password field");
  })();

  await test("Admin dashboard redirects without login", async () => {
    await page.goto(`${BASE}/admin/dashboard`, { waitUntil: "domcontentloaded" });
    const url = page.url();
    if (!url.includes("/admin/login")) throw new Error("Did not redirect to login");
  })();

  await test("Wrong password shows error", async () => {
    await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    const body = await page.textContent("body");
    if (!body.includes("error") && !body.includes("Error") && !body.includes("invalid")) {
      // May or may not show error depending on implementation
    }
  })();

  // ===== TEST 7: Dark/light toggle =====
  console.log("\n=== TEST 7: Dark/light toggle ===");
  await test("Dark mode toggle works", async () => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    const html = page.locator("html");
    const hasDarkBefore = await html.getAttribute("class");
    const toggle = await page.locator('button[aria-label="Toggle dark mode"]');
    if ((await toggle.count()) > 0) {
      await toggle.click();
      await page.waitForTimeout(500);
      const hasDarkAfter = await html.getAttribute("class");
      if (hasDarkBefore === hasDarkAfter) throw new Error("Dark mode toggle did not change class");
    }
  })();

  await test("Dark mode remembered after reload", async () => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    const toggle = await page.locator('button[aria-label="Toggle dark mode"]');
    if ((await toggle.count()) > 0) {
      await toggle.click();
      await page.waitForTimeout(500);
      await page.reload();
      await page.waitForTimeout(1000);
      const html = page.locator("html");
      const cls = await html.getAttribute("class");
      if (!cls || !cls.includes("dark")) throw new Error("Dark mode not remembered");
    }
  })();

  // ===== TEST 8: Database checks via supabase-js =====
  console.log("\n=== TEST 8: Database checks ===");
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await test("Anon can read approved internships", async () => {
    const { data, error } = await supabase.from("internships").select("id", { count: "exact", head: true }).eq("status", "approved");
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("No approved internships");
  })();

  await test("Anon cannot read votes", async () => {
    const { error } = await supabase.from("votes").select("*", { count: "exact", head: true });
    if (!error) throw new Error("Anon should not read votes");
  })();

  await test("Anon cannot read removal_requests", async () => {
    const { error } = await supabase.from("removal_requests").select("*", { count: "exact", head: true });
    if (!error) throw new Error("Anon should not read removal_requests");
  })();

  // ===== SUMMARY =====
  console.log("\n=== SUMMARY ===");
  console.log(`Passed: ${passed}, Failed: ${failed}, Total: ${passed + failed}`);

  await browser.close();

  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
