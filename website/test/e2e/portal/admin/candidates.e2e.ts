import { RecipientStatus } from '@/generated/prisma/enums';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { getCandidateService, getFirebaseAdminService } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('Add new candidate', async ({ page }) => {
	const expectedCandidate = {
		firstName: 'Steve',
		lastName: 'Rogers',
		status: RecipientStatus.waitlisted,
		localPartnerName: 'Kenema Youth Foundation',
	};

	await page.goto('http://localhost:3000/portal/admin/candidates');
	await page.getByRole('button', { name: 'Add new candidate' }).click();

	await page.getByTestId('form-item-status').click();
	await page.getByRole('option', { name: 'waitlisted' }).click();

	await page.getByTestId('form-item-localPartner').click();
	await page.getByRole('option', { name: expectedCandidate.localPartnerName }).click();

	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(expectedCandidate.firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(expectedCandidate.lastName);

	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const candidateService = await getCandidateService();
	const result = await candidateService.getTableView('user-2');

	if (!result.success) {
		throw new Error(result.error);
	}

	expect(result.data.tableRows.length).toBe(13);

	const row = result.data.tableRows.find(
		(r) => r.firstName === expectedCandidate.firstName && r.lastName === expectedCandidate.lastName,
	);

	expect(row).toBeDefined();

	expect(row?.firstName).toBe(expectedCandidate.firstName);
	expect(row?.lastName).toBe(expectedCandidate.lastName);
	expect(row?.status).toBe(expectedCandidate.status);
	expect(row?.localPartnerName).toBe(expectedCandidate.localPartnerName);
});

test('Edit existing candidate', async ({ page }) => {
	const expected = {
		firstName: 'Natasha',
		lastName: 'Romanoff',
		status: RecipientStatus.waitlisted,
		successorName: 'Yelena Belova',
		callingName: 'Black Widow',
		email: 'natasha.romanoff@example.com',
		language: 'en',
		profession: 'Intelligence Operative',
		gender: 'female',
		localPartnerName: 'Bo Women Empowerment Group',
		phone: '+444444444',
		paymentProvider: 'orange_money',
		paymentCode: 'OM123456',
		country: 'Sierra Leone',
	};

	const firebaseService = await getFirebaseAdminService();
	await firebaseService.deleteByPhoneNumberIfExists('+444444444');

	await page.goto('http://localhost:3000/portal/admin/candidates');
	await page.getByRole('cell', { name: 'Hawa' }).click();

	await page.getByTestId('form-item-successorName').locator('input').fill(expected.successorName);
	await page.getByTestId('form-item-termsAccepted').locator('button').click();

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

	const candidateService = await getCandidateService();
	const tableResult = await candidateService.getTableView('user-2');

	if (!tableResult.success) {
		throw new Error(tableResult.error);
	}

	expect(tableResult.data.tableRows.length).toBe(12);

	const row = tableResult.data.tableRows.find(
		(r) => r.firstName === expected.firstName && r.lastName === expected.lastName,
	);

	expect(row).toBeDefined();
	expect(row?.status).toBe(expected.status);
	expect(row?.localPartnerName).toBe(expected.localPartnerName);

	// Check if the auth user was created/updated
	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill('+444444');
	await expect(page.getByRole('cell', { name: '+444444444' })).toBeVisible();
});

// test('Delete recipient', async ({ page }) => {
// 	const firebaseService = await getFirebaseAdminService();
// 	await firebaseService.createByPhoneNumber('+41791234567');

// 	await page.goto('http://localhost:4000/auth');
// 	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill('+41791234567');
// 	await expect(page.getByRole('cell', { name: '+41791234567' })).toBeVisible();

// 	await page.goto('http://localhost:3000/portal/management/recipients');
// 	await page.getByRole('cell', { name: 'Badingu' }).click();

// 	await page.getByRole('button', { name: 'Delete' }).click();
// 	await page.getByRole('button', { name: 'Delete permanently' }).click();
// 	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

// 	const recipientService = await getRecipientService();
// 	const tableResult = await recipientService.getTableView('user-2');

// 	if (!tableResult.success) {
// 		throw new Error(tableResult.error);
// 	}

// 	expect(tableResult.data.tableRows.length).toBe(6);

// 	const row = tableResult.data.tableRows.find((r) => r.firstName === 'John' && r.lastName === 'Badingu');

// 	expect(row).toBeUndefined();

// 	// Check if the auth user was deleted
// 	await page.goto('http://localhost:4000/auth');
// 	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill('+41791234567');
// 	await expect(page.getByRole('cell', { name: '+41791234567' })).toHaveCount(0);
// });

// test('CSV Upload', async ({ page }) => {
// 	const expectedRecipients = [
// 		{
// 			firstName: 'Bruce',
// 			lastName: 'Banner',
// 			status: RecipientStatus.active,
// 			programName: 'Migros Relief SL',
// 			localPartnerName: 'Makeni Development Initiative',
// 		},
// 		{
// 			firstName: 'Natasha',
// 			lastName: 'Romanoff',
// 			status: RecipientStatus.suspended,
// 			programName: 'Migros Relief SL',
// 			localPartnerName: 'Makeni Development Initiative',
// 		},
// 		{
// 			firstName: 'Clint',
// 			lastName: 'Barton',
// 			status: RecipientStatus.active,
// 			programName: 'Migros Education SL',
// 			localPartnerName: 'Bo Women Empowerment Group',
// 		},
// 	];

// 	await page.goto('http://localhost:3000/portal/management/recipients');

// 	await page.getByRole('button', { name: 'Upload CSV' }).click();
// 	await page.getByTestId('csv-dropzone-input').setInputFiles('./test/e2e/portal/management/upload-example.csv');

// 	await page.getByTestId('import-button').click();

// 	await expect(page.getByText('Successfully imported 3 items.')).toBeVisible();

// 	const recipientService = await getRecipientService();
// 	const result = await recipientService.getTableView('user-2');

// 	if (!result.success) {
// 		throw new Error(result.error);
// 	}

// 	for (const expected of expectedRecipients) {
// 		const row = result.data.tableRows.find(
// 			(r) => r.firstName === expected.firstName && r.lastName === expected.lastName,
// 		);

// 		expect(row).toBeDefined();
// 		expect(row?.firstName).toBe(expected.firstName);
// 		expect(row?.lastName).toBe(expected.lastName);
// 		expect(row?.status).toBe(expected.status);
// 		expect(row?.programName).toBe(expected.programName);
// 		expect(row?.localPartnerName).toBe(expected.localPartnerName);
// 	}
// });
