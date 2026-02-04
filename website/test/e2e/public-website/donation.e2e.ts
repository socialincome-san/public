import { seedDatabase } from '@/lib/database/seed/run-seed';
import { FirebaseService } from '@/lib/services/firebase/firebase.service';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

test('Stripe One Time Donation flow', async ({ page }) => {
	const TEST_EMAIL = 'dean.winchester@supernatural.com';

	const firebaseService = new FirebaseService();
	await firebaseService.deleteByEmailIfExists(TEST_EMAIL);

	await page.goto('/en/int/donate/one-time');

	await page.getByRole('button', { name: 'Donate Now' }).click();

	await page.waitForURL(/https:\/\/checkout\.stripe\.com\/c\/pay\/.*/);

	await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL);
	await page.getByRole('textbox', { name: 'Card number' }).fill('4242 4242 4242 4242');
	await page.getByRole('textbox', { name: 'Expiration' }).fill('12 / 66');
	await page.getByRole('textbox', { name: 'CVC' }).fill('424');
	await page.getByRole('textbox', { name: 'Cardholder name' }).fill('Dean Winchester');

	const zipField = page.getByRole('textbox', { name: 'ZIP' });

	if (await zipField.count()) {
		// stripe form is rendered IP-dependently
		// in CI there are some more required fields (like ZIP and Phone number) than in local dev
		await zipField.fill('12345');
		await page.getByRole('textbox', { name: 'Phone number' }).fill('123-456-7890');
	}

	await page.getByTestId('hosted-payment-submit-button').click();

	await page.waitForURL(/\/en\/int\/donate\/success\/stripe\/.*/);
	await page.getByTestId('terms-and-conditions').click();
	await page.getByRole('button', { name: 'Confirm' }).click();

	await page.waitForURL(/\/en\/int\/login.*/);

	// Check if the auth user was created
	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill(TEST_EMAIL);
	await expect(page.getByRole('cell', { name: 'Dean Winchester' })).toBeVisible();

	//Unfortunately we cannot test if the contribution was created in our DB as we are not able to send the webhook-call to the test environment
});
