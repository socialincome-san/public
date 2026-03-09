import 'dotenv/config';

import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { saveStoryblokMock, setupStoryblokMock } from '../mock-server';
import { assertContactExistsByEmail } from '../utils';
import { loginAs } from './utils';

test.describe.configure({ mode: 'serial' });

test('seed database', async () => {
	await seedDatabase();
	await assertContactExistsByEmail('test@portal.org');
});

test('wait for emulators to be ready', async ({ page }) => {
	for (let i = 0; i < 30; i++) {
		try {
			await page.goto('http://127.0.0.1:4000/logs');
			await page.getByPlaceholder('Filter or search logs...').fill('All emulators ready');
			await page.getByRole('button', { name: 'Apply' }).click();
			await expect(page.getByText('All emulators ready! It is now safe to connect your app.')).toBeVisible();
			return;
		} catch {}
		await page.waitForTimeout(1000);
	}

	throw new Error('Emulators did not become ready in time');
});

test('login all actors', async ({ browser }, testInfo) => {
	await setupStoryblokMock(testInfo);
	await Promise.all([loginAs(browser, 'user'), loginAs(browser, 'contributor'), loginAs(browser, 'partner')]);
	await saveStoryblokMock(testInfo);
});
