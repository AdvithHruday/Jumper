import { test, expect } from '@playwright/test';

test('the example finds a code-versus-wiring mismatch and pin bugs', async ({ page }) => {
  await page.goto('/fix/code');
  await page.getByRole('button', { name: /try an example with bugs/i }).click();

  await expect(page.getByLabel('Compare with a guided project')).toHaveValue('first-light');
  await expect(page.getByText(/connects the Red LED "led1" to pin 9/)).toBeVisible();
  await expect(page.getByText(/no PWM on the Arduino Uno/)).toBeVisible();
  await expect(page.getByRole('link', { name: /open fix my upload/i })).toHaveAttribute('href', '/fix/upload');
});

test('a correct blink sketch is clean, with an honest caveat', async ({ page }) => {
  await page.goto('/fix/code');
  await page.getByLabel('Paste your sketch').fill(
    'const int LED_PIN = 9;\nvoid setup(){ pinMode(LED_PIN, OUTPUT); }\nvoid loop(){ digitalWrite(LED_PIN, HIGH); delay(500); digitalWrite(LED_PIN, LOW); delay(500); }',
  );
  await expect(page.getByText('No pin problems found')).toBeVisible();
  await expect(page.getByText(/does not prove the sketch works/i)).toBeVisible();
});

test('switching to the ESP32 changes the rules and disables project comparison', async ({ page }) => {
  await page.goto('/fix/code');
  await page.getByLabel('Your board').selectOption('esp32-devkit-v1');
  await expect(page.getByLabel('Compare with a guided project')).toBeDisabled();
  await page.getByRole('button', { name: /try an example with bugs/i }).click();
  await expect(page.getByText(/input-only on the ESP32 DevKit V1/)).toBeVisible();
  await expect(page.getByText(/fails while WiFi is running/)).toBeVisible();
});
