# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\basic.test.ts >> InternBD - Page Load Tests >> Post page loads
- Location: tests\basic.test.ts:26:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/post", waiting until "load"

```

# Test source

```ts
  1   | // Playwright tests for InternBD
  2   | // Run with: npx playwright test
  3   | 
  4   | import { test, expect } from '@playwright/test';
  5   | 
  6   | test.describe('InternBD - Page Load Tests', () => {
  7   |   const pages = [
  8   |     { url: '/', name: 'Home' },
  9   |     { url: '/internships', name: 'Internships' },
  10  |     { url: '/post', name: 'Post' },
  11  |     { url: '/about', name: 'About' },
  12  |     { url: '/contact', name: 'Contact' },
  13  |     { url: '/privacy', name: 'Privacy' },
  14  |     { url: '/terms', name: 'Terms' },
  15  |     { url: '/companies', name: 'Companies' },
  16  |     { url: '/categories', name: 'Categories' },
  17  |     { url: '/locations', name: 'Locations' },
  18  |     { url: '/admin/login', name: 'Admin Login' },
  19  |     { url: '/safety-tips', name: 'Safety Tips' },
  20  |     { url: '/for-employers', name: 'For Employers' },
  21  |     { url: '/report', name: 'Report' },
  22  |     { url: '/saved', name: 'Saved' },
  23  |   ];
  24  | 
  25  |   pages.forEach(({ url, name }) => {
  26  |     test(`${name} page loads`, async ({ page }) => {
> 27  |       const response = await page.goto(url, { timeout: 10000 });
      |                                   ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  28  |       expect(response.status()).toBe(200);
  29  |     });
  30  |   });
  31  | 
  32  |   test('404 page returns 404', async ({ page }) => {
  33  |     const response = await page.goto('http://localhost:3000/nonexistent');
  34  |     expect(response.status()).toBe(404);
  35  |   });
  36  | });
  37  | 
  38  | test.describe('InternBD - Navigation Tests', () => {
  39  |   test('Navigate from home to internships', async ({ page }) => {
  40  |     await page.goto('http://localhost:3000/');
  41  |     await page.click('a[href="/internships"]');
  42  |     await expect(page).toHaveURL('http://localhost:3000/internships');
  43  |   });
  44  | 
  45  |   test('Navigate from home to post', async ({ page }) => {
  46  |     await page.goto('http://localhost:3000/');
  47  |     await page.click('a[href="/post"]');
  48  |     await expect(page).toHaveURL('http://localhost:3000/post');
  49  |   });
  50  | 
  51  |   test('Navigate from internships to post', async ({ page }) => {
  52  |     await page.goto('http://localhost:3000/internships');
  53  |     await page.click('a[href="/post"]');
  54  |     await expect(page).toHaveURL('http://localhost:3000/post');
  55  |   });
  56  | 
  57  |   test('Navigate from post to admin login', async ({ page }) => {
  58  |     await page.goto('http://localhost:3000/post');
  59  |     await page.click('a[href="/admin/login"]');
  60  |     await expect(page).toHaveURL('http://localhost:3000/admin/login');
  61  |   });
  62  | });
  63  | 
  64  | test.describe('InternBD - Dark Mode Tests', () => {
  65  |   test('Dark mode toggle works and persists', async ({ page }) => {
  66  |     await page.goto('http://localhost:3000/');
  67  |     
  68  |     const html = page.locator('html');
  69  |     await expect(html).not.toHaveClass(/dark/);
  70  |     
  71  |     const themeToggle = page.locator('button[aria-label="Toggle dark mode"]');
  72  |     if (await themeToggle.isVisible()) {
  73  |       await themeToggle.click();
  74  |       await expect(html).toHaveClass(/dark/);
  75  |     }
  76  |     
  77  |     await page.reload();
  78  |     await expect(html).toHaveClass(/dark/);
  79  |     
  80  |     await themeToggle.click();
  81  |     await expect(html).not.toHaveClass(/dark/);
  82  |   });
  83  | });
  84  | 
  85  | test.describe('InternBD - Admin Access Tests', () => {
  86  |   test('Admin dashboard redirects to login without auth', async ({ page }) => {
  87  |     await page.goto('http://localhost:3000/admin/dashboard');
  88  |     await expect(page).toHaveURL('http://localhost:3000/admin/login');
  89  |   });
  90  | 
  91  |   test('Admin moderate redirects to login without auth', async ({ page }) => {
  92  |     await page.goto('http://localhost:3000/admin/moderate');
  93  |     await expect(page).toHaveURL('http://localhost:3000/admin/login');
  94  |   });
  95  | 
  96  |   test('Admin login page has password field', async ({ page }) => {
  97  |     await page.goto('http://localhost:3000/admin/login');
  98  |     await expect(page.locator('input[type="password"]')).toBeVisible();
  99  |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  100 |   });
  101 | });
  102 | 
  103 | test.describe('InternBD - Bookmark Widget Test', () => {
  104 |   test('Bookmark button exists on detail page', async ({ page }) => {
  105 |     await page.goto('http://localhost:3000/internship/f4f61b72-3b61-4d46-9952-26c4a0e3f019');
  106 |     if ((await page.locator('h1').count()) > 0) {
  107 |       const bookmarkBtn = page.locator('button[aria-label="Bookmark"]');
  108 |       if (await bookmarkBtn.isVisible()) {
  109 |         await bookmarkBtn.click();
  110 |         await expect(bookmarkBtn).toHaveClass(/text-amber-500/);
  111 |       }
  112 |     }
  113 |   });
  114 | });
```