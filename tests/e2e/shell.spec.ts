import { test, expect } from '@playwright/test';

test.describe('header', () => {
  test('shows the three sections and marks the current one', async ({ page }) => {
    await page.goto('/fix/upload');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link')).toHaveText(['Fix', 'Learn', 'Parts']);
    await expect(nav.getByRole('link', { name: 'Fix' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Learn' })).not.toHaveAttribute('aria-current');

    await page.goto('/learn/projects/first-light/2');
    await expect(nav.getByRole('link', { name: 'Learn' })).toHaveAttribute('aria-current', 'page');
  });

  test('marks no section on the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Main' }).locator('[aria-current]')).toHaveCount(0);
  });

  test('the logo links home', async ({ page }) => {
    await page.goto('/fix');
    await page.getByRole('link', { name: 'Ohmwise home' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('menu', () => {
  test('opens with the groups and links, and closes with Escape returning focus to the button', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Menu' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    const menu = page.locator('#site-menu');
    await expect(menu.getByText('Appearance')).toBeVisible();
    await expect(menu.getByRole('link', { name: 'About Ohmwise' })).toHaveAttribute('href', '/about');
    await expect(menu.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');

    const feedback = menu.getByRole('link', { name: /Send feedback/ });
    await expect(feedback).toHaveAttribute('href', /\/issues$/);
    await expect(feedback).toHaveAttribute('target', '_blank');
    await expect(feedback).toHaveAttribute('rel', /noopener/);

    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(button).toBeFocused();
  });

  test('closes when you click outside it', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.locator('#site-menu')).toBeVisible();
    // The panel can cover the heading on a phone, so click a point that is clear of it.
    await page.mouse.click(5, 650);
    await expect(page.locator('#site-menu')).toHaveCount(0);
  });

  test('closes when you follow a link in it', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.locator('#site-menu').getByRole('link', { name: 'About Ohmwise' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator('#site-menu')).toHaveCount(0);
  });

  test('can be reached and operated with the keyboard alone', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await expect(page.locator('#site-menu').getByRole('button', { name: 'System' })).toBeFocused();
  });
});

test.describe('theme', () => {
  test('Dark is applied, remembered across a reload, and System clears it', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('button', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('ohmwise.theme'))).toBe('dark');

    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('button', { name: 'System' }).click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    expect(await page.evaluate(() => localStorage.getItem('ohmwise.theme'))).toBeNull();
  });

  test('a saved dark choice paints dark immediately, with no light flash', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('ohmwise.theme', 'dark'));
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(15, 21, 27)');
  });

  test('a saved light choice wins over a dark operating system', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('ohmwise.theme', 'light'));
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(238, 242, 245)');
  });
});

test.describe('page frame', () => {
  test('a skip link is the first tab stop and moves focus to the content', async ({ page }) => {
    await page.goto('/fix');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('the footer says the project is independent and links to About and Privacy', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await expect(footer).toContainText('not affiliated with or endorsed by Arduino or Espressif');
    await expect(footer.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    await expect(footer.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
  });

  test('sets no cookies, as the privacy page says', async ({ page, context }) => {
    for (const path of ['/', '/fix/code', '/learn/build', '/about', '/privacy']) await page.goto(path);
    expect(await context.cookies()).toEqual([]);
  });

  test('on a phone the sections sit on their own row under the logo, with no sideways scroll', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/');
    const logo = await page.getByRole('link', { name: 'Ohmwise home' }).boundingBox();
    const nav = await page.getByRole('navigation', { name: 'Main' }).boundingBox();
    expect(nav!.y).toBeGreaterThan(logo!.y + logo!.height - 1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
  });
});

test.describe('About and Privacy', () => {
  test('About credits the team by name with a mailto link and states the licence', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { name: 'About Ohmwise', level: 1 })).toBeVisible();
    await expect(page.getByText('Advith Hruday Ravulapati')).toBeVisible();
    await expect(page.getByText('Vishnu Ganesh Mukkavilli')).toBeVisible();
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(2);
    await expect(page.getByText(/released under the MIT licence/)).toBeVisible();
    await expect(page.getByText(/not tested on real hardware yet/i)).toBeVisible();
  });

  test('Privacy is specific about Photo scan and where questions go', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: 'Privacy', level: 1 })).toBeVisible();
    await expect(page.getByText('no accounts, no cookies and no analytics')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Photo scan' })).toBeVisible();
    await expect(page.getByText(/We do not store your photos/)).toBeVisible();
    // No project email is configured in tests, so it must fall back to GitHub, never an invented address.
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^GitHub/ })).toHaveAttribute('href', /\/issues$/);
  });
});
