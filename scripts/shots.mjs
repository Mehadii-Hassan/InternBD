import { chromium } from "playwright";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";

const SCREENSHOTS_DIR = join(process.cwd(), "screenshots");
if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const BASE = "http://localhost:3000";

const pages = [
  { url: "/", name: "home" },
  { url: "/internships?category=Software/IT", name: "listings-filtered" },
  { url: "/internship/4a43fbc9-5b3b-4970-9c18-941abc931235", name: "detail" },
  { url: "/post", name: "post" },
  { url: "/admin/login", name: "admin" },
  { url: "/faq", name: "faq" },
];

const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 375, height: 812 },
];

const themes = ["light", "dark"];

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

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);

    let count = 0;
    const total = pages.length * viewports.length * themes.length;

    for (const theme of themes) {
      await page.evaluate((t) => {
        localStorage.setItem("theme", t);
        document.documentElement.classList.toggle("dark", t === "dark");
      }, theme);

      for (const vp of viewports) {
        await page.setViewportSize({ width: vp.width, height: vp.height });

        for (const p of pages) {
          try {
            const res = await page.goto(`${BASE}${p.url}`, {
              waitUntil: "domcontentloaded",
              timeout: 15000,
            });
            if (!res || res.status() !== 200) {
              process.stdout.write(`SKIP ${p.name} ${vp.name} ${theme}: status ${res?.status()}\n`);
              continue;
            }
            await page.waitForTimeout(1000);
            const file = join(SCREENSHOTS_DIR, `${p.name}-${vp.name}-${theme}.png`);
            await page.screenshot({ path: file, fullPage: true });
            count++;
            process.stdout.write(`OK ${p.name} ${vp.name} ${theme}\n`);
          } catch (e) {
            process.stdout.write(`FAIL ${p.name} ${vp.name} ${theme}: ${e.message}\n`);
          }
        }
      }
    }

    process.stdout.write(`\nScreenshots: ${count}/${total} saved to ${SCREENSHOTS_DIR}\n`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  process.stderr.write(`FATAL: ${e.message}\n`);
  process.exit(1);
});
