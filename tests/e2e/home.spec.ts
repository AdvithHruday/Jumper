import { test, expect } from '@playwright/test';

const PROGRESS_KEY = 'jumper.progress.v1';
const progress = (at: Record<string, number>, done: Record<string, boolean> = {}) =>
  JSON.stringify({ state: { done, at, checkpoints: {}, ticks: {} }, version: 0 });

test.describe('hero', () => {
  test('states the problem and offers one primary action', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: "Find out why your Arduino build isn't working.", level: 1 }),
    ).toBeVisible();
    const primary = page.getByRole('link', { name: 'Fix my upload', exact: true });
    await expect(primary).toHaveCount(1);
    await expect(primary).toHaveAttribute('href', '/fix/upload');
    await expect(page.getByRole('link', { name: /or start learning/ })).toHaveAttribute('href', '/learn');
  });

  test('shows a working diagnosis before anyone types anything', async ({ page }) => {
    await page.goto('/');
    const demo = page.getByLabel('Example: paste an upload error and see the likely cause');
    await expect(demo.getByText('The board is not answering the uploader')).toBeVisible();
    // Compact: the first three steps, with the way to the rest.
    await expect(demo.getByRole('listitem')).toHaveCount(3);
    await expect(demo.getByRole('link', { name: /See every step/ })).toHaveAttribute('href', '/fix/upload');
  });

  test('re-diagnoses as you edit the error', async ({ page }) => {
    await page.goto('/');
    const demo = page.getByLabel('Example: paste an upload error and see the likely cause');
    await demo
      .getByLabel('Paste an upload error')
      .fill('A fatal error occurred: Failed to connect to ESP32: Wrong boot mode detected (0x13)!');
    await expect(demo.getByText('The ESP32 booted normally instead of into download mode')).toBeVisible();
    await expect(demo.getByText('The board is not answering the uploader')).toHaveCount(0);
  });

  test('is honest about an error it does not know, and about being empty', async ({ page }) => {
    await page.goto('/');
    const demo = page.getByLabel('Example: paste an upload error and see the likely cause');
    const box = demo.getByLabel('Paste an upload error');
    await box.fill('something nobody has seen before');
    await expect(demo.getByText('We do not recognise this error yet.')).toBeVisible();
    await box.fill('');
    await expect(demo.getByText('Paste an error above and the likely cause shows up here.')).toBeVisible();
  });
});

test.describe('the rest of the page', () => {
  test('starts from what hurts, using the same wording as the Fix hub', async ({ page }) => {
    await page.goto('/');
    const section = page.getByRole('region', { name: 'Where does it hurt?' });
    await expect(section.getByRole('heading', { level: 3 })).toHaveText([
      "Why won't it upload?",
      'It uploads, but nothing happens',
      "I'm just starting",
    ]);
    await expect(section.getByRole('link', { name: /Why won't it upload/ })).toHaveAttribute('href', '/fix/upload');
    await expect(section.getByRole('link', { name: /nothing happens/ })).toHaveAttribute('href', '/fix/code');
    await expect(section.getByRole('link', { name: /just starting/ })).toHaveAttribute('href', '/learn');

    await page.goto('/fix');
    await expect(page.getByText("Why won't it upload?", { exact: true })).toBeVisible();
    await expect(page.getByText('It uploads, but nothing happens', { exact: true })).toBeVisible();
  });

  test('shows real counts and says nothing about users or accuracy', async ({ page }) => {
    await page.goto('/');
    const proof = page.getByRole('region', { name: 'Built on checks you can read' });
    const values = await proof.locator('dd').allTextContents();
    expect(values).toHaveLength(4);
    for (const v of values) expect(v === 'MIT' || /^[1-9]\d*$/.test(v), `unexpected stat "${v}"`).toBe(true);
    await expect(proof.getByText('upload errors recognised')).toBeVisible();
    await expect(proof.getByText('pin checks')).toBeVisible();
    const text = (await page.locator('main').innerText()).toLowerCase();
    for (const claim of ['thousands of', 'trusted by', 'testimonial', 'verified on hardware', '% accurate']) {
      expect(text, claim).not.toContain(claim);
    }
  });

  test('the sub-copy comes from the same place as the page description', async ({ page }) => {
    await page.goto('/');
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    await expect(page.getByText(description!, { exact: true })).toBeVisible();
  });
});

test.describe('returning learners', () => {
  test('a first-time visitor sees no banner', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Welcome back.')).toHaveCount(0);
  });

  test('someone mid-project is offered the project they were actually on', async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [PROGRESS_KEY, progress({ setup: 2, 'first-light': 5 })],
    );
    await page.goto('/');
    const banner = page.getByText('Welcome back.').locator('..');
    await expect(banner).toContainText('Light up an LED, step 5');
    await expect(page.getByRole('link', { name: 'Continue where you left off' })).toHaveAttribute(
      'href',
      '/learn/projects/first-light/5',
    );
  });

  test('finished projects are not offered again', async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [PROGRESS_KEY, progress({ setup: 4, 'first-light': 8 }, { setup: true, 'first-light': true })],
    );
    await page.goto('/');
    await expect(page.getByText('Welcome back.')).toHaveCount(0);
  });
});

test('on a phone the headline and the one action come before the demo, with no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/');
  const cta = await page.getByRole('link', { name: 'Fix my upload', exact: true }).boundingBox();
  const demo = await page.getByRole('textbox', { name: 'Paste an upload error' }).boundingBox();
  expect(cta!.y).toBeLessThan(demo!.y);
  expect(cta!.y + cta!.height).toBeLessThan(780);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('the Learn page holds the project list and the reset control', async ({ page }) => {
  await page.goto('/learn');
  await expect(page.getByText('Your progress is saved in this browser.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset progress' })).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Reset progress' })).toHaveCount(0);
});
