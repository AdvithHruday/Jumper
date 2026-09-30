import { test, expect } from '@playwright/test';

test('the catalog shows every part in the kit, grouped, with a drawing each', async ({ page }) => {
  await page.goto('/parts');
  await expect(page.getByRole('heading', { name: 'Meet your parts', level: 1 })).toBeVisible();
  await expect(page.getByText(/All 27 parts in the kit/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sensors', level: 2 })).toBeVisible();
  await expect(page.locator('main a[href^="/parts/"]')).toHaveCount(27);
  await expect(page.getByRole('img', { name: /Drawing of HC-SR04 ultrasonic sensor/ })).toBeVisible();
});

test('a part page explains the drawing, the legs and where it is used', async ({ page }) => {
  await page.goto('/parts');
  await page.getByRole('link', { name: /5 mm LED/ }).click();
  await expect(page).toHaveURL(/\/parts\/led-5mm$/);
  await expect(page.getByRole('heading', { name: '5 mm LED (any colour)', level: 1 })).toBeVisible();
  await expect(page.getByText(/Long leg: the anode/)).toBeVisible();
  await expect(page.getByText('Which way round matters')).toBeVisible();
  await expect(page.getByRole('img', { name: /Circuit symbol for 5 mm LED/ })).toBeVisible();
  await page.getByRole('link', { name: 'Blink an LED' }).click();
  await expect(page).toHaveURL(/\/learn\/build\/led-blink$/);
});

test('a resistor page reads its bands back as a value', async ({ page }) => {
  await page.goto('/parts/res-1k');
  await expect(page.getByRole('heading', { name: 'Reading the bands' })).toBeVisible();
  await expect(page.getByText(/1 kΩ, ±5%/)).toBeVisible();
});

test('pins that differ between makers say so and tell you to read your labels', async ({ page }) => {
  await page.goto('/parts/dht11');
  await expect(page.getByText('The order varies')).toBeVisible();
  await expect(page.getByText(/Read the labels printed on your own board/)).toBeVisible();
});

test('a board page shows pin facts from the same data the code checker uses', async ({ page }) => {
  await page.goto('/parts/esp32-devkit-v1');
  await expect(page.getByRole('heading', { name: 'Pin facts' })).toBeVisible();
  await expect(page.getByText(/Input-only pins/)).toBeVisible();
});

test('a build lists its parts as links to their pages', async ({ page }) => {
  await page.goto('/learn/build/line-follower');
  await page.getByRole('link', { name: /L298N motor driver module/ }).first().click();
  await expect(page).toHaveURL(/\/parts\/l298n$/);
});

test('an unknown part is a proper 404', async ({ page }) => {
  const response = await page.goto('/parts/not-a-part');
  expect(response?.status()).toBe(404);
});
