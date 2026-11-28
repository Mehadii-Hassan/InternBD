import { execSync, spawn } from "child_process";
import { chromium } from "playwright";
import { readFileSync } from "fs";
import { join } from "path";

// Load env
const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, "");
}

const BASE = "http://localhost:3000";
const SCREENSHOTS_DIR = join(process.cwd(), "screenshots");
let serverProc = null;
let passed = 0;
let failed = 0;
const results = [];

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

function waitForServer(maxRetries = 30, delayMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = fetchSync(`${BASE}/`);
      if (res && res.status === 200) return true;
    } catch {}
    // eslint-disable-next-line no-loop-func
    (() => {})();
    const start = Date.now();
    while (Date.now() - start < delayMs) {}
  }
  return false;
}

function fetchSync(url) {
  try {
    // Use node's built-in http for a simple sync check
    const http = require("http");
    return new Promise((resolve) => {
      const req = http.get(url, (res) => resolve(res));
      req.on("error", () => resolve(null));
      req.setTimeout(3000, () => { req.destroy(); resolve(null); });
    });
  } catch { return null; }
}

async function main() {
  // Check if server is already running
  let serverAlreadyRunning = false;
  try {
    const res = await fetchSync(`${BASE}/`);
    if (res && res.status === 200) {
      serverAlreadyRunning = true;
      process.stdout.write("Dev server already running on port 3000\n");
    }
  } catch {}

  if (!serverAlreadyRunning) {
    process.stdout.write("Starting dev server...\n");
    serverProc = spawn("npm", ["run", "dev"], {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, ...env },
    });

    serverProc.stdout.on("data", (data) => {
      const text = data.toString();
      if (text.includes("Ready") || text.includes("Local:")) {
        process.stdout.write(`Server: ${text.trim()}\n`);
      }
    });

    // Wait up to 60 seconds for server to start
    const startTime = Date.now();
    while (Date.now() - startTime < 60000) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const res = await fetchSync(`${BASE}/`);
        if (res && res.status === 200) break;
      } catch {}
    }
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

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

  process.stdout.write("\n=== E2E Tests ===\n");
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

  // Search test
  await test("Search filters work", async () => {
    await page.goto(`${BASE}/internships?q=software`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    const body = await page.textContent("body");
    if (!body.toLowerCase().includes("software")) throw new Error("Search term not reflected");
  })();

  // Category filter
  await test("Category filter works", async () => {
    await page.goto(`${BASE}/internships?category=Software/IT`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    const body = await page.textContent("body");
    if (!body.includes("Software/IT")) throw new Error("Category filter not applied");
  })();

  // Admin redirect
  await test("Admin dashboard redirects without login", async () => {
    await page.goto(`${BASE}/admin/dashboard`, { waitUntil: "domcontentloaded" });
    const url = page.url();
    if (!url.includes("/admin/login")) throw new Error("Did not redirect to login");
  })();

  // Dark mode toggle
  await test("Dark mode toggle works", async () => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    const html = page.locator("html");
    const clsBefore = await html.getAttribute("class");
    const toggle = page.locator('button[aria-label="Toggle dark mode"]');
    if ((await toggle.count()) > 0) {
      await toggle.click();
      await page.waitForTimeout(1000);
      const clsAfter = await html.getAttribute("class");
      if (clsBefore === clsAfter) throw new Error("Dark mode toggle did not change");
    }
  })();

  await browser.close();

  process.stdout.write(`\n=== RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total ===\n`);

  if (serverProc && !serverAlreadyRunning) {
    try { serverProc.kill("SIGTERM"); } catch {}
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  process.stderr.write(`FATAL: ${e.message}\n`);
  if (serverProc) { try { serverProc.kill("SIGTERM"); } catch {} }
  process.exit(1);
});
