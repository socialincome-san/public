import 'dotenv/config';

import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { loginAs } from './utils';

test('seed database', async () => {
	await seedDatabase();
	await prisma.contact.findUniqueOrThrow({
		where: { email: 'test@portal.org' },
	});
});

test('wait for emulators to be ready', async ({ page }) => {
	for (let i = 0; i < 30; i++) {
		try {
			await page.goto('http://127.0.0.1:4000/logs');
			await expect(page.getByText('All emulators ready')).toBeVisible();
			return;
		} catch {}
		await page.waitForTimeout(1000);
	}

	throw new Error('Emulators did not become ready in time');
});

test('login all actors', async ({ browser }) => {
	await Promise.all([loginAs(browser, 'user'), loginAs(browser, 'contributor'), loginAs(browser, 'partner')]);
});
