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

test('Home page displays main message', async ({ page }) => {
	await page.goto('/');
	await expect(
		page.getByText('How many people can you lift out of poverty with only 1% of your income?'),
	).toBeVisible();
});

test('Portal redirects to login when not authenticated', async ({ page }) => {
	await page.goto('/portal');
	await expect(page).toHaveURL(/\/en\/int\/login/);
	await expect(page.getByText('Sign in to your account')).toBeVisible();
});

test('emulator logs', async ({ page }) => {
	await new Promise((r) => setTimeout(r, 10000)); // wait for emulators to start
	await page.goto('http://127.0.0.1:4000/logs');
	await expect(page.getByText('All emulators ready!')).toBeVisible();
});

test('email login via emulator', async ({ page }) => {
	const email = 'test@portal.org';

	await page.goto('/en/int/login');

	//make a screenshot of the login page
	await page.screenshot({ path: 'login-page.png' });

	await page.fill('input[type="email"]', email);
	await page.click('button[type="submit"]');

	//another screenshot after submitting email
	await page.screenshot({ path: 'after-submit-email.png' });

	console.log('Waiting for email to be generated in emulator...');
	await new Promise((r) => setTimeout(r, 2000)); // wait for emulator to generate email

	// one-shot request to emulator
	const res = await page.request.get('http://127.0.0.1:9099/emulator/v1/projects/demo-social-income-local/oobCodes');

	const data = (await res.json()) as FirebaseOobCodesResponse;

	const latest = [...data.oobCodes].reverse().find((x) => x.email === email && x.requestType === 'EMAIL_SIGNIN');

	expect(latest).toBeDefined();

	await page.goto(latest!.oobLink);

	await expect(page.getByText(/welcome/i)).toBeVisible();
});
