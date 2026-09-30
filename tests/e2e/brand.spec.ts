import { test, expect } from '@playwright/test';

test('the page title and header carry the Ohmwise name', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/^Ohmwise: /);
  await expect(page.getByRole('link', { name: 'Ohmwise home' })).toBeVisible();
});

test('other pages use the "%s | Ohmwise" title template', async ({ page }) => {
  await page.goto('/parts');
  await expect(page).toHaveTitle('Meet your parts | Ohmwise');
});

test('the favicon is the Ohmwise mark, not the framework default', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="icon"]').first().getAttribute('href');
  expect(href).toContain('/icon.svg');
  const icon = await request.get('/icon.svg');
  expect(icon.status()).toBe(200);
  expect(icon.headers()['content-type']).toContain('image/svg+xml');
  expect(await icon.text()).toContain('#f2b53a');
});

test('the touch icon and social preview are real PNGs at the right size', async ({ request }) => {
  const png = [0x89, 0x50, 0x4e, 0x47];
  for (const [url, w, h] of [
    ['/apple-icon', 180, 180],
    ['/opengraph-image', 1200, 630],
  ] as const) {
    const res = await request.get(url);
    expect(res.status(), url).toBe(200);
    expect(res.headers()['content-type'], url).toContain('image/png');
    const body = await res.body();
    expect([...body.subarray(0, 4)], url).toEqual(png);
    // PNG header: width and height are big-endian 32-bit ints at bytes 16 and 20.
    expect(body.readUInt32BE(16), `${url} width`).toBe(w);
    expect(body.readUInt32BE(20), `${url} height`).toBe(h);
  }
});

test('the web manifest names the app', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest');
  expect(res.status()).toBe(200);
  const m = await res.json();
  expect(m.short_name).toBe('Ohmwise');
  expect(m.start_url).toBe('/');
  expect(m.icons.length).toBeGreaterThan(0);
});

test('the social preview tags point at the generated image', async ({ page }) => {
  await page.goto('/');
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toContain('/opengraph-image');
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Ohmwise');
});
