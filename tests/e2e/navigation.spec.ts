import { test, expect } from '@playwright/test';

test.describe('old URLs keep working', () => {
  const MOVED: [string, string][] = [
    ['/check', '/fix/code'],
    ['/build', '/learn/build'],
    ['/build/line-follower', '/learn/build/line-follower'],
    ['/projects/first-light/3', '/learn/projects/first-light/3'],
  ];

  for (const [from, to] of MOVED) {
    test(`${from} permanently redirects to ${to}`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(new URL(res.headers()['location'], 'http://x').pathname).toBe(to);
    });
  }

  test('a moved URL lands on the real page in a browser', async ({ page }) => {
    await page.goto('/check');
    await expect(page).toHaveURL(/\/fix\/code$/);
    await expect(page.getByRole('heading', { name: 'Check my code', level: 1 })).toBeVisible();
  });
});

test('the Fix hub offers both tools and says when to use each', async ({ page }) => {
  await page.goto('/fix');
  await expect(page.getByRole('heading', { name: 'Fix', level: 1 })).toBeVisible();
  await expect(page.getByText('The IDE shows a red error when you press Upload.')).toBeVisible();
  await expect(page.getByText('The upload works but an LED, sensor or motor does nothing.')).toBeVisible();
  await page.getByRole('link', { name: /Fix my upload/ }).first().click();
  await expect(page).toHaveURL(/\/fix\/upload$/);
});

test('the Learn hub lists the guided projects and links to the kit builder', async ({ page }) => {
  await page.goto('/learn');
  await expect(page.getByRole('heading', { name: 'Learn', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /Get your board talking/ })).toBeVisible();
  await page.getByRole('link', { name: /What can I build\?/ }).first().click();
  await expect(page).toHaveURL(/\/learn\/build$/);
});

test('leaving a guided project goes back to Learn, not the home page', async ({ page }) => {
  await page.goto('/learn/projects/first-light/1');
  await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Learn' }).click();
  await expect(page).toHaveURL(/\/learn$/);
});
