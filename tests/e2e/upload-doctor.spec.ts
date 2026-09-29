import { test, expect } from '@playwright/test';

test('diagnoses a pasted avrdude error and lists ordered fixes', async ({ page }) => {
  await page.goto('/fix/upload');
  await page.getByLabel(/paste the red error text/i).fill(
    'avrdude: stk500_recv(): programmer is not responding\navrdude: stk500_getsync() attempt 1 of 10: not in sync: resp=0x00',
  );
  await expect(page.getByRole('heading', { name: /board is not answering the uploader/i })).toBeVisible();
  await expect(page.getByText('Most likely', { exact: true })).toBeVisible();
  await expect(page.getByText(/Old Bootloader/).first()).toBeVisible();
});

test('falls back to a checklist for an error it does not know', async ({ page }) => {
  await page.goto('/fix/upload');
  await page.getByLabel(/paste the red error text/i).fill('something nobody has seen before');
  await expect(page.getByRole('heading', { name: /do not recognise this error/i })).toBeVisible();
});

test('the example button fills the log and shows a diagnosis', async ({ page }) => {
  await page.goto('/fix/upload');
  await page.getByRole('button', { name: /try an example/i }).click();
  await expect(page.getByRole('heading', { name: /board is not answering the uploader/i })).toBeVisible();
});
