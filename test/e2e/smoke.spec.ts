import { test, expect } from '@playwright/test';
test('login screen renders PeopleOS branding', async ({ page }) => { await page.goto('/login'); await expect(page.getByText('PeopleOS', { exact: true }).first()).toBeVisible(); await expect(page.getByRole('heading', { name: /people operations/i }).first()).toBeVisible(); });
