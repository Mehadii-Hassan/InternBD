import { chromium } from "playwright";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";

const SCREENSHOTS_DIR = join(process.cwd(), "screenshots");
if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const pages = [
  { url: "http://localhost:3000/", name: "home", label: "Home" },
  { url: "http://localhost:3000/internships", name: "listings", label: "Listings" },
  { url: "http://localhost:3000/post", name: "post", label: "Post" },
  { url: "http://localhost:3000/admin/login", name: "admin-login", label: "Admin Login" },
];

const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 375, height: 812 },
];

const themes = ["light", "dark"];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let count = 0;
  const total = pages.length * viewports.length * themes.length;

  for (const theme of themes) {
    // Set theme via localStorage before navigation
    await page.evaluate((t) => {
      localStorage.setItem("theme", t);
      document.documentElement.classList.toggle("dark", t === "dark");
    }, theme);

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const p of pages) {
        try {
          const res = await page.goto(p.url, { waitUntil: "domcontentloaded", timeout: 10000 });
          if (!res || res.status() !== 200) {
            console.log(`SKIP ${p.label} ${vp.name} ${theme}: status ${res?.status()}`);
            continue;
          }
          await page.waitForTimeout(1000); // let animations settle
          const file = join(SCREENSHOTS_DIR, `${p.name}-${vp.name}-${theme}.png`);
          await page.screenshot({ path: file, fullPage: true });
          count++;
          console.log(`OK ${p.label} ${vp.name} ${theme}`);
        } catch (e) {
          console.log(`FAIL ${p.label} ${vp.name} ${theme}: ${e.message}`);
        }
      }
    }
  }

  await browser.close();
  console.log(`\nScreenshots: ${count}/${total} saved to ${SCREENSHOTS_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
