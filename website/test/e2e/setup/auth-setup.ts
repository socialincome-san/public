import 'dotenv/config';

import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

type FirebaseOobCode = {
	email: string;
	requestType: string;
	oobCode: string;
	oobLink: string;
};

type FirebaseOobCodesResponse = {
	oobCodes: FirebaseOobCode[];
};

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

test('Portal redirects to login when not authenticated', async ({ page }) => {
	await page.goto('/portal');
	await expect(page).toHaveURL(/\/en\/int\/login/);
	await expect(page.getByText('Sign in to your account')).toBeVisible();
});

test('email login via emulator', async ({ page }) => {
	const email = 'test@portal.org';

	await page.goto('/en/int/login');

	await page.fill('input[type="email"]', email);
	await page.click('button[type="submit"]');

	const res = await page.request.get('http://127.0.0.1:9099/emulator/v1/projects/demo-social-income-local/oobCodes');

	const data = (await res.json()) as FirebaseOobCodesResponse;

	const latest = [...data.oobCodes].reverse().find((x) => x.email === email && x.requestType === 'EMAIL_SIGNIN');

	expect(latest).toBeDefined();

	await page.goto(latest!.oobLink);

	// needs DB to work
	// await expect(page.getByText(/welcome/i)).toBeVisible();
	await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
