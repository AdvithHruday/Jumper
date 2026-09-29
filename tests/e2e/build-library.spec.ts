import { test, expect } from '@playwright/test';

test('picking a starter kit shows what can be built and what is one part away', async ({ page }) => {
  await page.goto('/build');
  await expect(page.getByText(/pick a starter kit or add the parts you own/i)).toBeVisible();

  await page.getByRole('button', { name: 'Basic Uno starter kit' }).click();
  await expect(page.getByRole('heading', { name: /you can build these now/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Blink an LED/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /almost there/i })).toBeVisible();
  // The basic kit has no servo, so the servo build needs exactly that.
  await expect(page.getByRole('link', { name: /Servo sweep[\s\S]*SG90 micro servo/ })).toBeVisible();
});

test('adding a missing part moves a project into "can build now"', async ({ page }) => {
  await page.goto('/build');
  await page.getByRole('button', { name: 'Basic Uno starter kit' }).click();
  await expect(page.getByRole('link', { name: /Servo sweep/ })).toContainText('You still need');

  await page.getByRole('button', { name: 'More SG90 micro servo' }).click();
  await expect(page.getByRole('link', { name: /Servo sweep/ })).not.toContainText('You still need');
});

test('the kit is remembered after a reload', async ({ page }) => {
  await page.goto('/build');
  await page.getByRole('button', { name: 'ESP32 starter' }).click();
  await expect(page.getByRole('link', { name: /Control an LED from your phone/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: /you can build these now/i })).toBeVisible();
});

test('a project page shows wiring, the sketch, mistakes and an honest hardware note', async ({ page }) => {
  await page.goto('/build/line-follower');
  await expect(page.getByRole('heading', { name: 'Line-following robot', level: 2 })).toBeVisible();
  await expect(page.getByText(/Not built on real hardware yet/)).toBeVisible();
  await expect(page.getByRole('cell', { name: 'D5' })).toBeVisible();
  await expect(page.getByText('drive(SPEED, SPEED)')).toBeVisible();
  await expect(page.getByText(/The robot spins in circles/)).toBeVisible();
});

test('the blink build links to the guided step-by-step version', async ({ page }) => {
  await page.goto('/build/led-blink');
  await page.getByRole('link', { name: /step by step with diagrams/i }).click();
  await expect(page).toHaveURL(/\/projects\/first-light\/1/);
});

test('an unknown build is a 404', async ({ page }) => {
  expect((await page.goto('/build/nope'))?.status()).toBe(404);
});
