import { test, expect } from '@playwright/test';

test('an unknown address shows the 404 page, keeps the header, and returns a real 404', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'We can’t find that page', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Fix a build' })).toHaveAttribute('href', '/fix');
  await expect(page.getByRole('link', { name: 'Ohmwise home' })).toBeVisible();
});

test('an unknown project or build is a 404 with the same page', async ({ page }) => {
  for (const path of ['/learn/build/nope', '/learn/projects/nope/1', '/learn/projects/first-light/99']) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
    await expect(page.getByRole('heading', { name: 'We can’t find that page' }), path).toBeVisible();
  }
});

test('robots.txt allows the site, hides internal pages and points at the sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text).toMatch(/User-Agent: \*/i);
  expect(text).toMatch(/Disallow: \/design/);
  expect(text).toMatch(/Disallow: \/api\//);
  expect(text).toMatch(/Sitemap: .*\/sitemap\.xml/);
});

test('the sitemap lists real pages and leaves out the internal one', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

  expect(urls).toContain('/fix/upload');
  expect(urls).toContain('/learn/build/line-follower');
  expect(urls).toContain('/learn/projects/first-light/8');
  expect(urls).not.toContain('/design');
  expect(new Set(urls).size).toBe(urls.length);

  // Every URL it advertises must actually resolve.
  for (const path of urls) {
    const page = await request.get(path);
    expect(page.status(), path).toBe(200);
  }
});
