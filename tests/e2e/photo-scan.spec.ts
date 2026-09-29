import { test, expect, type Page } from '@playwright/test';

// A valid 1x1 PNG; the browser decodes and re-encodes it like a real photo.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const RESULT = {
  parts: [
    { id: 'uno', qty: 1, confidence: 'high', evidence: 'blue board with a USB-B socket' },
    { id: 'led-5mm', qty: 5, confidence: 'high', evidence: 'five small domes' },
    { id: 'res-220', qty: 2, confidence: 'high', evidence: 'red red brown bands' },
    { id: 'hc-sr04', qty: 1, confidence: 'low', evidence: 'blue board with two cylinders' },
  ],
  unrecognised: ['OLED display'],
  notes: 'One photo is a little dark.',
};

async function choosePhoto(page: Page) {
  await page.getByLabel('Choose photos').setInputFiles({ name: 'desk.png', mimeType: 'image/png', buffer: PNG });
}

const qtyOf = (page: Page, name: string) => page.locator('li', { hasText: name }).locator('span.tabular-nums').first();

test('scan, review, confirm: only what the student ticks reaches the kit', async ({ page }) => {
  let upload = '';
  await page.route('**/api/scan', async (route) => {
    upload = route.request().postData() ?? '';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(RESULT) });
  });

  await page.goto('/build');
  await choosePhoto(page);
  await page.getByRole('button', { name: 'Scan 1 photo' }).click();
  await expect(page.getByRole('heading', { name: /here is what we think we see/i })).toBeVisible();

  // The photo was compressed and sent as a JPEG named photo-1.jpg.
  expect(upload).toContain('name="photos"');
  expect(upload).toContain('photo-1.jpg');

  // Sure parts are ticked; resistors and unsure parts are not.
  await expect(page.getByRole('checkbox', { name: /Arduino Uno/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: /5 mm LED/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: /220 Ω resistor/ })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: /HC-SR04/ })).not.toBeChecked();
  await expect(page.getByText(/OLED display/)).toBeVisible();
  await expect(page.getByText(/a little dark/)).toBeVisible();

  // Correct a count and opt in to the resistors.
  await page.getByRole('button', { name: 'Fewer 5 mm LED (any colour)' }).first().click();
  await page.getByRole('checkbox', { name: /220 Ω resistor/ }).check();
  await page.getByRole('button', { name: 'Add 3 to my kit' }).click();

  await expect(page.getByRole('status')).toContainText('Added 3 kinds of part');
  await expect(qtyOf(page, 'Arduino Uno (or clone)')).toHaveText('1');
  await expect(qtyOf(page, '5 mm LED (any colour)')).toHaveText('4');
  await expect(qtyOf(page, '220 Ω resistor')).toHaveText('2');
  await expect(qtyOf(page, 'HC-SR04 ultrasonic sensor')).toHaveText('0');
});

test('a scan failure shows a clear message and keeps the photos', async ({ page }) => {
  await page.route('**/api/scan', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'not_configured', message: 'Photo scan is not set up on this server yet. Pick your parts by hand instead.' }),
    }),
  );
  await page.goto('/build');
  await choosePhoto(page);
  await page.getByRole('button', { name: 'Scan 1 photo' }).click();
  await expect(page.locator('p[role="alert"]')).toContainText('not set up on this server');
  await expect(page.getByRole('button', { name: 'Scan 1 photo' })).toBeVisible();
});

test('photos can be removed and the count is capped at five', async ({ page }) => {
  await page.goto('/build');
  const files = Array.from({ length: 6 }, (_, i) => ({ name: `p${i}.png`, mimeType: 'image/png', buffer: PNG }));
  await page.getByLabel('Choose photos').setInputFiles(files);
  await expect(page.getByRole('button', { name: 'Scan 5 photos' })).toBeVisible();
  await expect(page.locator('p[role="alert"]')).toContainText('up to 5 photos');
  await page.getByRole('button', { name: 'Remove photo 1' }).click();
  await expect(page.getByRole('button', { name: 'Scan 4 photos' })).toBeVisible();
});

test('the real endpoint refuses cleanly when no API key is configured', async ({ request }) => {
  test.skip(!!process.env.ANTHROPIC_API_KEY, 'a key is set, so this would call the real API');
  const res = await request.post('/api/scan', { multipart: { photos: { name: 'p.png', mimeType: 'image/png', buffer: PNG } } });
  expect(res.status()).toBe(503);
  expect((await res.json()).error).toBe('not_configured');
});
