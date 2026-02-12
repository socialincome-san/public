import { RecipientStatus } from '@/generated/prisma/enums';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { getFirebaseAdminService, getRecipientService } from '../../utils';

const ADD_RECIPIENT = {
	firstName: 'Tony',
	lastName: 'Stark',
	status: RecipientStatus.waitlisted,
	programName: 'Migros Relief SL',
	localPartnerName: 'Kenema Youth Foundation',
};

const EDIT_RECIPIENT = {
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

const CSV_RECIPIENTS = [
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

test.beforeEach(async () => {
	await seedDatabase();
});

test('Add new recipient', async ({ page }) => {
	await page.goto('/portal/management/recipients');
	await page.getByRole('button', { name: 'Add new recipient' }).click();

	await page.getByTestId('form-item-status').click();
	await page.getByRole('option', { name: 'waitlisted' }).click();

	await page.getByTestId('form-item-program').click();
	await page.getByRole('option', { name: ADD_RECIPIENT.programName }).click();

	await page.getByTestId('form-item-localPartner').click();
	await page.getByRole('option', { name: ADD_RECIPIENT.localPartnerName }).click();

	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(ADD_RECIPIENT.firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(ADD_RECIPIENT.lastName);

	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const service = await getRecipientService();
	const result = await service.getTableView('user-2');

	if (!result.success) throw new Error(result.error);

	const row = result.data.tableRows.find(
		(r) => r.firstName === ADD_RECIPIENT.firstName && r.lastName === ADD_RECIPIENT.lastName,
	);

	expect(row).toBeDefined();
	expect(row?.status).toBe(ADD_RECIPIENT.status);
	expect(row?.programName).toBe(ADD_RECIPIENT.programName);
	expect(row?.localPartnerName).toBe(ADD_RECIPIENT.localPartnerName);
});

test('Edit existing recipient', async ({ page }) => {
	const firebaseService = await getFirebaseAdminService();
	await firebaseService.deleteByPhoneNumberIfExists(EDIT_RECIPIENT.phone);

	await page.goto('/portal/management/recipients');
	await page.getByRole('cell', { name: 'Mohamed' }).click();

	await page.getByTestId('form-item-startDate').locator('button').click();
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByLabel('Choose the Year').selectOption('2020');
	await page.getByRole('button', { name: 'Thursday, March 12th,' }).click();

	await page.getByTestId('form-item-successorName').locator('input').fill(EDIT_RECIPIENT.successorName);
	await page.getByTestId('form-item-termsAccepted').locator('button').click();

	await page.getByTestId('form-item-program').click();
	await page.getByRole('option', { name: EDIT_RECIPIENT.programName }).click();

	await page.getByTestId('form-item-localPartner').click();
	await page.getByRole('option', { name: EDIT_RECIPIENT.localPartnerName }).click();

	await page.getByTestId('form-accordion-trigger-paymentInformation').click();
	await page.getByTestId('form-item-paymentInformation.provider').click();
	await page.getByRole('option', { name: EDIT_RECIPIENT.paymentProvider }).click();
	await page.getByTestId('form-item-paymentInformation.code').locator('input').fill(EDIT_RECIPIENT.paymentCode);
	await page.getByTestId('form-item-paymentInformation.phone').locator('input').fill(EDIT_RECIPIENT.phone);

	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(EDIT_RECIPIENT.firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(EDIT_RECIPIENT.lastName);
	await page.getByTestId('form-item-contact.callingName').locator('input').fill(EDIT_RECIPIENT.callingName);
	await page.getByTestId('form-item-contact.email').locator('input').fill(EDIT_RECIPIENT.email);

	await page.getByTestId('form-item-contact.language').click();
	await page.getByRole('option', { name: EDIT_RECIPIENT.language }).click();

	await page.getByTestId('form-item-contact.dateOfBirth').locator('button').click();
	await page.getByLabel('Choose the Year').selectOption('1996');
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByRole('button', { name: 'Tuesday, March 12th,' }).click();

	await page.getByTestId('form-item-contact.profession').locator('input').fill(EDIT_RECIPIENT.profession);
	await page.getByTestId('form-item-contact.gender').click();
	await page.getByRole('option', { name: EDIT_RECIPIENT.gender }).click();

	await page.getByTestId('form-item-contact.street').locator('input').fill('Main Street');
	await page.getByTestId('form-item-contact.number').locator('input').fill('42');
	await page.getByTestId('form-item-contact.city').locator('input').fill('Freetown');
	await page.getByTestId('form-item-contact.zip').locator('input').fill('1000');
	await page.getByTestId('form-item-contact.country').click();
	await page.getByRole('option', { name: EDIT_RECIPIENT.country }).click();

	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const service = await getRecipientService();
	const result = await service.getTableView('user-2');

	if (!result.success) throw new Error(result.error);

	const row = result.data.tableRows.find(
		(r) => r.firstName === EDIT_RECIPIENT.firstName && r.lastName === EDIT_RECIPIENT.lastName,
	);

	expect(row).toBeDefined();
	expect(row?.programName).toBe(EDIT_RECIPIENT.programName);
	expect(row?.localPartnerName).toBe(EDIT_RECIPIENT.localPartnerName);

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill('666666');
	await expect(page.getByRole('cell', { name: EDIT_RECIPIENT.phone })).toBeVisible();
});

test('Delete recipient', async ({ page }) => {
	const phone = '+41791234567';
	const firebaseService = await getFirebaseAdminService();
	await firebaseService.createByPhoneNumber(phone);

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill(phone);
	await expect(page.getByRole('cell', { name: phone })).toBeVisible();

	await page.goto('/portal/management/recipients');
	await page.getByRole('cell', { name: 'Badingu' }).click();

	await page.getByRole('button', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Delete permanently' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const service = await getRecipientService();
	const result = await service.getTableView('user-2');

	if (!result.success) throw new Error(result.error);

	const deleted = result.data.tableRows.find((r) => r.firstName === 'John' && r.lastName === 'Badingu');

	expect(deleted).toBeUndefined();

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill(phone);
	await expect(page.getByRole('cell', { name: phone })).toHaveCount(0);
});

test('CSV Upload', async ({ page }) => {
	await page.goto('/portal/management/recipients');

	await page.getByRole('button', { name: 'Upload CSV' }).click();
	await page.getByTestId('csv-dropzone-input').setInputFiles('./test/e2e/portal/management/upload-example.csv');
	await page.getByTestId('import-button').click();

	await expect(page.getByText('Successfully imported 3 items.')).toBeVisible();

	const service = await getRecipientService();
	const result = await service.getTableView('user-2');

	if (!result.success) throw new Error(result.error);

	for (const expected of CSV_RECIPIENTS) {
		const row = result.data.tableRows.find(
			(r) => r.firstName === expected.firstName && r.lastName === expected.lastName,
		);

		expect(row).toBeDefined();
		expect(row?.status).toBe(expected.status);
		expect(row?.programName).toBe(expected.programName);
		expect(row?.localPartnerName).toBe(expected.localPartnerName);
	}
});
