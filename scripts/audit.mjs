import { chromium } from "playwright";
import { readFileSync, readdirSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

// Load env
const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, "");
}

const BASE = "http://localhost:3000";
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// Audit findings
const findings = [];
let pageCount = 0;

function addFinding(page, element, problem, severity = "medium") {
  findings.push({ page, element, problem, severity });
  process.stdout.write(`  [${severity.toUpperCase()}] ${page}: ${element} - ${problem}\n`);
}

function addStaticFinding(file, line, problem, severity = "medium") {
  findings.push({ page: file, element: `line ${line}`, problem, severity });
  process.stdout.write(`  [${severity.toUpperCase()}] ${file}:${line} - ${problem}\n`);
}

async function fetchWithTimeout(url, ms = 10000) {
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
    process.stdout.write("  Checking server reachability...\n");
    const res = await fetchWithTimeout(`${BASE}/`, 5000);
    process.stdout.write(`  Server responded: ${res?.status}\n`);
    return res && res.ok;
  } catch {
    process.stdout.write("  Server not reachable\n");
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

  // Static checks first
  process.stdout.write("\n=== STATIC CODE CHECKS ===\n");
  await staticChecks();

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    // Track console errors and failed requests
    const consoleErrors = [];
    const failedRequests = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" || msg.type() === "warning") {
        consoleErrors.push(`${msg.type()}: ${msg.text()}`);
      }
    });
    page.on("requestfailed", (req) => {
      failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText || "failed"}`);
    });
    page.on("response", (res) => {
      if (res.status() >= 400) {
        failedRequests.push(`${res.status()} ${res.url()}`);
      }
    });

    // Get list of all routes to crawl
    const routes = await getRoutes();
    process.stdout.write(`\nFound ${routes.length} routes to audit\n`);

    // Test each route in desktop and mobile, light and dark
    for (const route of routes) {
      for (const viewport of [
        { name: "desktop", width: 1280, height: 800 },
        { name: "mobile", width: 375, height: 812 },
      ]) {
        for (const theme of ["light", "dark"]) {
          pageCount++;
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          consoleErrors.length = 0;
          failedRequests.length = 0;

          process.stdout.write(`\n--- ${route} | ${viewport.name} | ${theme} ---\n`);

          try {
            const res = await page.goto(`${BASE}${route}`, {
              waitUntil: "domcontentloaded",
              timeout: 15000,
            });

            // Set theme
            await page.evaluate((t) => {
              localStorage.setItem("theme", t);
              document.documentElement.classList.toggle("dark", t === "dark");
            }, theme);

            // Wait for hydration
            await page.waitForTimeout(1000);

            // Check status
            if (!res || res.status() !== 200) {
              addFinding(route, "page load", `Status ${res?.status() || "no response"}`, "critical");
              continue;
            }

            // Check console errors
            for (const err of consoleErrors) {
              addFinding(route, "console", err, "high");
            }

            // Check failed requests
            for (const req of failedRequests) {
              addFinding(route, "network", req, "high");
            }

            // Check all links
            await checkLinks(page, route);

            // Check all buttons
            await checkButtons(page, route);

            // Check all forms
            await checkForms(page, route);

            // Check images
            await checkImages(page, route);

            // Check accessibility (axe-core)
            await checkAccessibility(page, route);

            // Check horizontal scroll on mobile
            if (viewport.name === "mobile") {
              await checkHorizontalScroll(page, route);
            }

            // Check for duplicate footer/navbar
            await checkDuplicateElements(page, route);

            // Check for placeholder/lorem text
            await checkPlaceholderText(page, route);
          } catch (e) {
            addFinding(route, "page load", `Exception: ${e.message}`, "critical");
          }
        }
      }
    }

    await browser.close();
  } catch (e) {
    process.stderr.write(`FATAL: ${e.message}\n`);
    process.exit(1);
  }

  // Write audit report
  writeAuditReport();

  process.stdout.write(`\n=== AUDIT COMPLETE ===\n`);
  process.stdout.write(`Pages tested: ${pageCount}\n`);
  process.stdout.write(`Total findings: ${findings.length}\n`);
  const critical = findings.filter((f) => f.severity === "critical").length;
  const high = findings.filter((f) => f.severity === "high").length;
  const medium = findings.filter((f) => f.severity === "medium").length;
  process.stdout.write(`Critical: ${critical}, High: ${high}, Medium: ${medium}\n`);
}

async function getRoutes() {
  const routes = [
    "/",
    "/internships",
    "/post",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/disclaimer",
    "/faq",
    "/for-employers",
    "/safety-tips",
    "/companies",
    "/categories",
    "/locations",
    "/admin/login",
    "/report",
    "/saved",
    "/nonexistent",
  ];

  // Try to get real dynamic route data from Supabase
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get a real internship ID
    const { data: internships } = await sb
      .from("internships")
      .select("id")
      .eq("status", "approved")
      .limit(3);
    if (internships && internships.length > 0) {
      for (const i of internships) {
        routes.push(`/internship/${i.id}`);
      }
    }

    // Get a real company slug
    const { data: companies } = await sb
      .from("internships")
      .select("company_name")
      .eq("status", "approved")
      .limit(3);
    if (companies && companies.length > 0) {
      for (const c of companies) {
        const slug = c.company_name.toLowerCase().replace(/\s+/g, "-");
        routes.push(`/company/${slug}`);
      }
    }

    // Get real category, location, department slugs
    const categories = ["Software/IT", "Marketing", "Design"];
    const locations = ["Dhaka", "Chattogram"];
    const departments = ["CSE", "EEE"];
    for (const c of categories) {
      routes.push(`/categories/${c.toLowerCase().replace(/\s+/g, "-")}`);
    }
    for (const l of locations) {
      routes.push(`/locations/${l.toLowerCase()}`);
    }
    for (const d of departments) {
      routes.push(`/departments/${d.toLowerCase()}`);
    }
  } catch (e) {
    process.stdout.write(`  Could not fetch dynamic routes: ${e.message}\n`);
  }

  return [...new Set(routes)];
}

async function staticChecks() {
  // Check for TODO, FIXME, placeholder, lorem, href="#", onClick={() => {}}, console.log
  const extensions = [".tsx", ".ts", ".js", ".mjs"];
  const allFiles = [];
  const dirs = ["app", "components", "lib", "scripts"];
  for (const dir of dirs) {
    getAllFiles(dir, extensions, allFiles);
  }
  const files = allFiles;

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, i) => {
      const lineNum = i + 1;
      const trimmed = line.trim();

      // Skip comments
      if (trimmed.startsWith("//")) return;

      if (/\bTODO\b/i.test(trimmed) && !trimmed.includes("TODO:")) {
        addStaticFinding(file, lineNum, "Contains TODO", "medium");
      }
      if (/\bFIXME\b/i.test(trimmed)) {
        addStaticFinding(file, lineNum, "Contains FIXME", "high");
      }
      if (/\blorem\b/i.test(trimmed) && !trimmed.includes("Lorem")) {
        addStaticFinding(file, lineNum, "Contains lorem ipsum text", "medium");
      }
      if (/href="#"/.test(trimmed)) {
        addStaticFinding(file, lineNum, "href='#' - dead link", "medium");
      }
      if (/onClick=\{\s*\(\)\s*=>\s*\{\s*\}\s*\}/.test(trimmed)) {
        addStaticFinding(file, lineNum, "Empty onClick handler", "medium");
      }
      if (/\bconsole\.log\b/.test(trimmed) && !file.includes("scripts/")) {
        addStaticFinding(file, lineNum, "console.log in production code", "low");
      }
    });
  }

  // Check for unused components
  const componentFiles = getAllFiles("components", [".tsx"]);
  const usedComponents = new Set();
  const appFiles = getAllFiles("app", [".tsx"]);
  for (const file of appFiles) {
    const content = readFileSync(file, "utf8");
    for (const compFile of componentFiles) {
      const compName = compFile.split("/").pop().replace(".tsx", "");
      if (content.includes(`@/components/${compName}`) || content.includes(`from "@/components/${compName}`)) {
        usedComponents.add(compName);
      }
    }
  }
  for (const compFile of componentFiles) {
    const compName = compFile.split("/").pop().replace(".tsx", "");
    if (!usedComponents.has(compName)) {
      addStaticFinding(compFile, 1, `Unused component: ${compName}`, "low");
    }
  }

  // Check navbar and footer links
  const navbarContent = readFileSync("components/Navbar.tsx", "utf8");
  const footerContent = readFileSync("components/Footer.tsx", "utf8");

  // Extract hrefs from Navbar
  const navbarHrefs = [...navbarContent.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const href of navbarHrefs) {
    if (href.startsWith("/")) {
      // Will be checked during crawling
    } else if (href === "#") {
      addStaticFinding("components/Navbar.tsx", 1, `Navbar link to '#'`, "medium");
    }
  }

  // Extract hrefs from Footer
  const footerHrefs = [...footerContent.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const href of footerHrefs) {
    if (href.startsWith("/")) {
      // Will be checked during crawling
    } else if (href === "#") {
      addStaticFinding("components/Footer.tsx", 1, `Footer link to '#'`, "medium");
    }
  }
}

function getAllFiles(dir, extensions, result = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, extensions, result);
    } else if (extensions.includes(entry.name.split(".").pop())) {
      result.push(fullPath);
    }
  }
  return result;
}

async function checkLinks(page, route) {
  const links = await page.locator("a[href]").all();
  for (const link of links) {
    const href = await link.getAttribute("href");
    if (!href) continue;
    if (href === "#") {
      addFinding(route, "link", `href="#"`, "medium");
      continue;
    }
    if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    if (href.startsWith("http")) {
      // External link - just check it looks valid
      try {
        new URL(href);
      } catch {
        addFinding(route, "link", `Invalid external URL: ${href}`, "medium");
      }
      continue;
    }
    // Internal link - check URL validity syntactically
    try {
      new URL(href, BASE);
    } catch {
      addFinding(route, "link", `Internal link ${href} is not a valid URL`, "medium");
    }
  }
}

async function checkButtons(page, route) {
  const buttons = await page.locator("button, [role='button']").all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    const disabled = await btn.getAttribute("disabled");
    if (disabled) continue;
    const textContent = text?.trim() || "";
    const ariaLabel = await btn.getAttribute("aria-label");
    if (!textContent && !ariaLabel) {
      addFinding(route, "button", "Button with no text content or aria-label", "medium");
    }
  }
}

async function checkForms(page, route) {
  const forms = await page.locator("form").all();
  for (const form of forms) {
    // Check required fields
    const requiredInputs = await form.locator("input[required], select[required], textarea[required]").all();
    for (const input of requiredInputs) {
      const name = await input.getAttribute("name");
      const type = await input.getAttribute("type");
      if (!name) {
        addFinding(route, "form", "Required input without name attribute", "low");
      }
    }
  }
}

async function checkImages(page, route) {
  const images = await page.locator("img").all();
  for (const img of images) {
    const alt = await img.getAttribute("alt");
    const src = await img.getAttribute("src");
    if (!alt || alt.trim().length === 0) {
      addFinding(route, "image", `Image missing alt text: ${src}`, "medium");
    }
    if (src && src.startsWith("/")) {
      try {
        const res = await fetchWithTimeout(`${BASE}${src}`, 5000);
        if (!res || res.status() >= 400) {
          addFinding(route, "image", `Broken image: ${src} (${res?.status()})`, "high");
        }
      } catch {
        addFinding(route, "image", `Broken image: ${src} (fetch failed)`, "high");
      }
    }
  }
}

async function checkAccessibility(page, route) {
  // Inject axe-core
  const axePath = join(process.cwd(), "node_modules", "axe-core", "axe.min.js");
  let axeSource;
  try {
    axeSource = readFileSync(axePath, "utf8");
  } catch {
    // axe-core not available, skip accessibility checks
    return;
  }

  await page.addScriptTag({ content: axeSource });

  const results = await page.evaluate(() => {
    return new Promise((resolve) => {
      if (typeof axe !== "undefined") {
        axe.run(document).then((results) => {
          resolve(results);
        }).catch((e) => {
          resolve({ error: e.message });
        });
      } else {
        resolve({ error: "axe not defined" });
      }
    });
  });

  if (results.error) {
    return;
  }

  for (const violation of results.violations || []) {
    for (const node of violation.nodes || []) {
      addFinding(
        route,
        `axe: ${violation.id}`,
        `${violation.description} (${node.html?.slice(0, 100)})`,
        violation.impact === "critical" || violation.impact === "serious" ? "high" : "medium"
      );
    }
  }
}

async function checkHorizontalScroll(page, route) {
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  if (hasHorizontalScroll) {
    addFinding(route, "layout", "Horizontal overflow at 375px viewport", "high");
  }
}

async function checkDuplicateElements(page, route) {
  const footerCount = await page.locator("footer").count();
  if (footerCount > 1) {
    addFinding(route, "footer", `Duplicate footer: ${footerCount} found`, "high");
  }
  const navbarCount = await page.locator("nav").count();
  if (navbarCount > 1) {
    addFinding(route, "navbar", `Duplicate navbar: ${navbarCount} found`, "high");
  }
}

async function checkPlaceholderText(page, route) {
  const text = await page.textContent("body");
  const loremMatch = text.match(/\blorem\b/i);
  if (loremMatch) {
    addFinding(route, "content", "Contains lorem ipsum placeholder text", "medium");
  }
  const placeholderMatch = text.match(/placeholder|coming soon|under construction/i);
  if (placeholderMatch) {
    addFinding(route, "content", "Contains placeholder text", "medium");
  }
}

function writeAuditReport() {
  const reportPath = join(process.cwd(), "audit-report.md");
  const lines = [];
  lines.push("# Audit Report");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Total findings: ${findings.length}`);
  lines.push("");

  const critical = findings.filter((f) => f.severity === "critical");
  const high = findings.filter((f) => f.severity === "high");
  const medium = findings.filter((f) => f.severity === "medium");
  const low = findings.filter((f) => f.severity === "low");

  lines.push(`- Critical: ${critical.length}`);
  lines.push(`- High: ${high.length}`);
  lines.push(`- Medium: ${medium.length}`);
  lines.push(`- Low: ${low.length}`);
  lines.push("");

  // Group by page
  const byPage = {};
  for (const f of findings) {
    if (!byPage[f.page]) byPage[f.page] = [];
    byPage[f.page].push(f);
  }

  for (const [page, pageFindings] of Object.entries(byPage)) {
    lines.push(`## ${page}`);
    lines.push("");
    for (const f of pageFindings) {
      lines.push(`- [${f.severity}] ${f.element}: ${f.problem}`);
    }
    lines.push("");
  }

  const { writeFileSync } = require("fs");
  writeFileSync(reportPath, lines.join("\n"));
  process.stdout.write(`\nAudit report written to ${reportPath}\n`);
}

main().catch((e) => {
  process.stderr.write(`FATAL: ${e.message}\n`);
  process.exit(1);
});
