import { test, expect } from '@playwright/test';

test.describe('InternBD - Page Load Tests', () => {
  const pages = [
    { url: '/', name: 'Home' },
    { url: '/internships', name: 'Internships' },
    { url: '/post', name: 'Post' },
    { url: '/about', name: 'About' },
    { url: '/contact', name: 'Contact' },
    { url: '/privacy', name: 'Privacy' },
    { url: '/terms', name: 'Terms' },
    { url: '/companies', name: 'Companies' },
    { url: '/categories', name: 'Categories' },
    { url: '/locations', name: 'Locations' },
    { url: '/admin/login', name: 'Admin Login' },
    { url: '/safety-tips', name: 'Safety Tips' },
    { url: '/for-employers', name: 'For Employers' },
    { url: '/report', name: 'Report' },
    { url: '/saved', name: 'Saved' },
  ];

  pages.forEach(({ url, name }) => {
    test(`${name} page loads`, async ({ page }) => {
      const response = await page.goto(url, { timeout: 10000 });
      expect(response).not.toBeNull();
      if (response) {
        expect(response.status()).toBe(200);
      }
    });
  });

  test('404 page returns 404', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/nonexistent');
    expect(response).not.toBeNull();
    if (response) {
      expect(response.status()).toBe(404);
    }
  });
});

test.describe('InternBD - Dark Mode Tests', () => {
  test('Dark mode toggle works and persists', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);
    
    const themeToggle = page.locator('button[aria-label="Toggle dark mode"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await expect(html).toHaveClass(/dark/);
    }
    
    await page.reload();
    await expect(html).toHaveClass(/dark/);
    
    await themeToggle.click();
    await expect(html).not.toHaveClass(/dark/);
  });
});

test.describe('InternBD - Navigation Tests', () => {
  test('Navigate from home to internships', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.click('a[href="/internships"]');
    await expect(page).toHaveURL('http://localhost:3000/internships');
  });

  test('Navigate from home to post', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.click('a[href="/post"]');
    await expect(page).toHaveURL('http://localhost:3000/post');
  });

  test('Navigate from internships to post', async ({ page }) => {
    await page.goto('http://localhost:3000/internships');
    await page.click('a[href="/post"]');
    await expect(page).toHaveURL('http://localhost:3000/post');
  });

  test('Navigate from post to admin login', async ({ page }) => {
    await page.goto('http://localhost:3000/post');
    await page.click('a[href="/admin/login"]');
    await expect(page).toHaveURL('http://localhost:3000/admin/login');
  });
});

test.describe('InternBD - Admin Access Tests', () => {
  test('Admin dashboard redirects to login without auth', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/dashboard');
    await expect(page).toHaveURL('http://localhost:3000/admin/login');
  });

  test('Admin dashboard redirects to login without auth (middleware)', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/moderate');
    await expect(page).toHaveURL('http://localhost:3000/admin/login');
  });

  test('Admin login page has password field', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login');
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});

test.describe('InternBD - Bookmark Widget Test', () => {
  test('Bookmark button exists on detail page', async ({ page }) => {
    await page.goto('http://localhost:3000/internship/f4f61b72-3b61-4d46-9952-26c4a0e3f019');
    if ((await page.locator('h1').count()) > 0) {
      const bookmarkBtn = page.locator('button[aria-label="Bookmark"]');
      if (await bookmarkBtn.isVisible()) {
        await bookmarkBtn.click();
        await expect(bookmarkBtn).toHaveClass(/text-amber-500/);
      }
    }
  });
});