const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const pages = [
    { url: 'http://localhost:3000/', name: 'Home' },
    { url: 'http://localhost:3000/internships', name: 'Internships' },
    { url: 'http://localhost:3000/post', name: 'Post' },
    { url: 'http://localhost:3000/about', name: 'About' },
    { url: 'http://localhost:3000/contact', name: 'Contact' },
    { url: 'http://localhost:3000/privacy', name: 'Privacy' },
    { url: 'http://localhost:3000/terms', name: 'Terms' },
    { url: 'http://localhost:3000/companies', name: 'Companies' },
    { url: 'http://localhost:3000/categories', name: 'Categories' },
    { url: 'http://localhost:3000/locations', name: 'Locations' },
    { url: 'http://localhost:3000/admin/login', name: 'Admin Login' },
    { url: 'http://localhost:3000/safety-tips', name: 'Safety Tips' },
    { url: 'http://localhost:3000/for-employers', name: 'For Employers' },
    { url: 'http://localhost:3000/report', name: 'Report' },
    { url: 'http://localhost:3000/saved', name: 'Saved' },
    { url: 'http://localhost:3000/nonexistent', name: '404 Page' },
  ];

  const results = [];

  for (const { url, name } of pages) {
    try {
      const response = await page.goto(url, { timeout: 10000 });
      const status = response.status();
      const title = await page.title();
      results.push({ name, url, status: 'PASS', statusCode: status, title });
      console.log('PASS\t' + name + '\t' + url + '\t' + status);
    } catch (e) {
      results.push({ name, url, status: 'FAIL', error: e.message });
      console.log('FAIL\t' + name + '\t' + url + '\t' + e.message);
    }
  }

  await browser.close();

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log('\n=== SUMMARY ===');
  console.log('Passed: ' + passed + ', Failed: ' + failed + ', Total: ' + results.length);
})();
