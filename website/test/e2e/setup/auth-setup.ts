import 'dotenv/config';

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
