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

async function main() {
  const browser = await chromium.launch({ headless: true });
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
            process.stdout.write(`SKIP ${p.label ?? p.name} ${vp.name} ${theme}: status ${res?.status()}\n`);
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

  await browser.close();
  process.stdout.write(`\nScreenshots: ${count}/${total} saved to ${SCREENSHOTS_DIR}\n`);
}

main().catch((e) => {
  process.stderr.write(`FATAL: ${e.message}\n`);
  process.exit(1);
});
