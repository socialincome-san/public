import { seedDatabase } from '@/lib/database/seed/run-seed';
import { FirebaseService } from '@/lib/services/firebase/firebase.service';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import { expect, test } from '@playwright/test';
import { RecipientStatus } from '@prisma/client';

test.beforeEach(async () => {
	await seedDatabase();
});

test('Add new recipient', async ({ page }) => {
	const expectedRecipient = {
		firstName: 'Tony',
		lastName: 'Stark',
		status: RecipientStatus.waitlisted,
		programName: 'Migros Relief SL',
		localPartnerName: 'Kenema Youth Foundation',
	};

	await page.goto('http://localhost:3000/portal/management/recipients');
	await page.getByRole('button', { name: 'Add new recipient' }).click();

	await page.getByTestId('form-item-status').click();
	await page.getByRole('option', { name: 'waitlisted' }).click();

	await page.getByTestId('form-item-program').click();
	await page.getByRole('option', { name: expectedRecipient.programName }).click();

	await page.getByTestId('form-item-localPartner').click();
	await page.getByRole('option', { name: expectedRecipient.localPartnerName }).click();

	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(expectedRecipient.firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(expectedRecipient.lastName);

	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const recipientService = new RecipientService();
	const result = await recipientService.getTableView('user-2');

	if (!result.success) {
		throw new Error(result.error);
	}

	expect(result.data.tableRows.length).toBe(8);

	const row = result.data.tableRows.find(
		(r) => r.firstName === expectedRecipient.firstName && r.lastName === expectedRecipient.lastName,
	);

	expect(row).toBeDefined();

	expect(row?.firstName).toBe(expectedRecipient.firstName);
	expect(row?.lastName).toBe(expectedRecipient.lastName);
	expect(row?.status).toBe(expectedRecipient.status);
	expect(row?.programName).toBe(expectedRecipient.programName);
	expect(row?.localPartnerName).toBe(expectedRecipient.localPartnerName);
});

test('Edit existing recipient', async ({ page }) => {
	const expected = {
		firstName: 'Peter',
		lastName: 'Parker',
		successorName: 'May Parker',
		callingName: 'Spidey',
		email: 'peter.parker@example.com',
		language: 'en',
		profession: 'Photographer',
		gender: 'female',
		programName: 'Migros Education SL',
		localPartnerName: 'Bo Women Empowerment Group',
		phone: '+666666666',
		paymentProvider: 'orange_money',
		paymentCode: 'OM123456',
		country: 'Sierra Leone',
	};

	const firebaseService = new FirebaseService();
	await firebaseService.deleteByPhoneNumberIfExists('+666666666');

	await page.goto('http://localhost:3000/portal/management/recipients');
	await page.getByRole('cell', { name: 'Mohamed' }).click();

	await page.getByTestId('form-item-startDate').locator('button').click();
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByLabel('Choose the Year').selectOption('2020');
	await page.getByRole('button', { name: 'Thursday, March 12th,' }).click();

	await page.getByTestId('form-item-successorName').locator('input').fill(expected.successorName);
	await page.getByTestId('form-item-termsAccepted').locator('button').click();

	await page.getByTestId('form-item-program').click();
	await page.getByRole('option', { name: expected.programName }).click();

	await page.getByTestId('form-item-localPartner').click();
	await page.getByRole('option', { name: expected.localPartnerName }).click();

	await page.getByTestId('form-accordion-trigger-paymentInformation').click();

	await page.getByTestId('form-item-paymentInformation.provider').click();
	await page.getByRole('option', { name: expected.paymentProvider }).click();

	await page.getByTestId('form-item-paymentInformation.code').locator('input').fill(expected.paymentCode);
	await page.getByTestId('form-item-paymentInformation.phone').locator('input').fill(expected.phone);

	await page.getByTestId('form-accordion-trigger-contact').click();

	await page.getByTestId('form-item-contact.firstName').locator('input').fill(expected.firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(expected.lastName);
	await page.getByTestId('form-item-contact.callingName').locator('input').fill(expected.callingName);
	await page.getByTestId('form-item-contact.email').locator('input').fill(expected.email);

	await page.getByTestId('form-item-contact.language').click();
	await page.getByRole('option', { name: expected.language }).click();

	await page.getByTestId('form-item-contact.dateOfBirth').locator('button').click();
	await page.getByLabel('Choose the Year').selectOption('1996');
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByRole('button', { name: 'Tuesday, March 12th,' }).click();

	await page.getByTestId('form-item-contact.profession').locator('input').fill(expected.profession);

	await page.getByTestId('form-item-contact.gender').click();
	await page.getByRole('option', { name: expected.gender }).click();

	await page.getByTestId('form-item-contact.street').locator('input').fill('Main Street');
	await page.getByTestId('form-item-contact.number').locator('input').fill('42');
	await page.getByTestId('form-item-contact.city').locator('input').fill('Freetown');
	await page.getByTestId('form-item-contact.zip').locator('input').fill('1000');
	await page.getByTestId('form-item-contact.country').click();
	await page.getByRole('option', { name: expected.country }).click();

	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const recipientService = new RecipientService();
	const tableResult = await recipientService.getTableView('user-2');

	if (!tableResult.success) {
		throw new Error(tableResult.error);
	}

	expect(tableResult.data.tableRows.length).toBe(7);

	const row = tableResult.data.tableRows.find(
		(r) => r.firstName === expected.firstName && r.lastName === expected.lastName,
	);

	expect(row).toBeDefined();
	expect(row?.programName).toBe(expected.programName);
	expect(row?.localPartnerName).toBe(expected.localPartnerName);

	// Check if the auth user was created/updated
	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill('+666666');
	await expect(page.getByRole('cell', { name: '+666666666' })).toBeVisible();
});

test('Delete recipient', async ({ page }) => {
	const firebaseService = new FirebaseService();
	await firebaseService.createByPhoneNumber('+41791234567');

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill('+41791234567');
	await expect(page.getByRole('cell', { name: '+41791234567' })).toBeVisible();

	await page.goto('http://localhost:3000/portal/management/recipients');
	await page.getByRole('cell', { name: 'Badingu' }).click();

	await page.getByRole('button', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Delete permanently' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const recipientService = new RecipientService();
	const tableResult = await recipientService.getTableView('user-2');

	if (!tableResult.success) {
		throw new Error(tableResult.error);
	}

	expect(tableResult.data.tableRows.length).toBe(6);

	const row = tableResult.data.tableRows.find((r) => r.firstName === 'John' && r.lastName === 'Badingu');

	expect(row).toBeUndefined();

	// Check if the auth user was deleted
	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill('+41791234567');
	await expect(page.getByRole('cell', { name: '+41791234567' })).toHaveCount(0);
});

test('CSV Upload', async ({ page }) => {
	const expectedRecipients = [
		{
			firstName: 'Bruce',
			lastName: 'Banner',
			status: RecipientStatus.active,
			programName: 'Migros Relief SL',
			localPartnerName: 'Makeni Development Initiative',
		},
		{
			firstName: 'Natasha',
			lastName: 'Romanoff',
			status: RecipientStatus.suspended,
			programName: 'Migros Relief SL',
			localPartnerName: 'Makeni Development Initiative',
		},
		{
			firstName: 'Clint',
			lastName: 'Barton',
			status: RecipientStatus.active,
			programName: 'Migros Education SL',
			localPartnerName: 'Bo Women Empowerment Group',
		},
	];

	await page.goto('http://localhost:3000/portal/management/recipients');

	await page.getByRole('button', { name: 'Upload CSV' }).click();
	await page.getByTestId('csv-dropzone-input').setInputFiles('./test/e2e/portal/management/upload-example.csv');

	await page.getByTestId('import-recipients-button').click();

	await expect(page.getByText('Successfully imported 3 recipients.')).toBeVisible();

	const recipientService = new RecipientService();
	const result = await recipientService.getTableView('user-2');

	if (!result.success) {
		throw new Error(result.error);
	}

	for (const expected of expectedRecipients) {
		const row = result.data.tableRows.find(
			(r) => r.firstName === expected.firstName && r.lastName === expected.lastName,
		);

		expect(row).toBeDefined();
		expect(row?.firstName).toBe(expected.firstName);
		expect(row?.lastName).toBe(expected.lastName);
		expect(row?.status).toBe(expected.status);
		expect(row?.programName).toBe(expected.programName);
		expect(row?.localPartnerName).toBe(expected.localPartnerName);
	}
});
