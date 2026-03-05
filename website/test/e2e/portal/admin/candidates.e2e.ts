import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { getFirebaseAdminService, getPrismaClient } from '../../utils';

const ADD_CANDIDATE = {
	firstName: 'Steve',
	lastName: 'Rogers',
	localPartnerName: 'Kenema Youth Foundation',
};

const EDIT_CANDIDATE = {
	firstName: 'Natasha',
	lastName: 'Romanoff',
	successorName: 'Yelena Belova',
	callingName: 'Black Widow',
	email: 'natasha.romanoff@example.com',
	language: 'en',
	profession: 'Intelligence Operative',
	gender: 'female',
	localPartnerName: 'Bo Women Empowerment Group',
	phone: '+444444444',
	paymentProvider: 'Orange Money',
	paymentCode: 'OM123456',
	country: 'Sierra Leone',
};

const CSV_CANDIDATES = [
	{
		firstName: 'Bruce',
		lastName: 'Banner',
		localPartnerName: 'Makeni Development Initiative',
	},
	{
		firstName: 'Scott',
		lastName: 'Lang',
		localPartnerName: 'Makeni Development Initiative',
	},
	{
		firstName: 'Clint',
		lastName: 'Barton',
		localPartnerName: 'Bo Women Empowerment Group',
	},
];

test.beforeEach(async () => {
	await seedDatabase();
});

test('admin candidates page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/candidates');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('Add new candidate', async ({ page }) => {
	await page.goto('/portal/admin/candidates');
	await page.getByTestId('data-table-actions-button').click();
	await page.getByTestId('data-table-action-item-add-new-candidate').click();

	await page.getByTestId('form-item-localPartner').click();
	await page.getByRole('option', { name: ADD_CANDIDATE.localPartnerName }).click();

	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(ADD_CANDIDATE.firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(ADD_CANDIDATE.lastName);

	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const prisma = await getPrismaClient();
	const row = await prisma.recipient.findFirst({
		where: {
			programId: null,
			contact: {
				firstName: ADD_CANDIDATE.firstName,
				lastName: ADD_CANDIDATE.lastName,
			},
		},
		select: {
			localPartner: { select: { name: true } },
		},
	});

	expect(row).toBeDefined();
	expect(row?.localPartner?.name).toBe(ADD_CANDIDATE.localPartnerName);
});

test('Edit existing candidate', async ({ page }) => {
	const firebaseService = await getFirebaseAdminService();
	await firebaseService.deleteByPhoneNumberIfExists(EDIT_CANDIDATE.phone);

	await page.goto('/portal/admin/candidates');
	await page.getByRole('cell', { name: 'Hawa' }).click();

	await page.getByTestId('form-item-successorName').locator('input').fill(EDIT_CANDIDATE.successorName);
	await page.getByTestId('form-item-termsAccepted').locator('button').click();

	await page.getByTestId('form-item-localPartner').click();
	await page.getByRole('option', { name: EDIT_CANDIDATE.localPartnerName }).click();

	await page.getByTestId('form-accordion-trigger-paymentInformation').click();
	await page.getByTestId('form-item-paymentInformation.provider').click();
	await page.getByRole('option', { name: EDIT_CANDIDATE.paymentProvider }).click();
	await page.getByTestId('form-item-paymentInformation.code').locator('input').fill(EDIT_CANDIDATE.paymentCode);
	await page.getByTestId('form-item-paymentInformation.phone').locator('input').fill(EDIT_CANDIDATE.phone);

	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(EDIT_CANDIDATE.firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(EDIT_CANDIDATE.lastName);
	await page.getByTestId('form-item-contact.callingName').locator('input').fill(EDIT_CANDIDATE.callingName);
	await page.getByTestId('form-item-contact.email').locator('input').fill(EDIT_CANDIDATE.email);

	await page.getByTestId('form-item-contact.language').click();
	await page.getByRole('option', { name: EDIT_CANDIDATE.language }).click();

	await page.getByTestId('form-item-contact.dateOfBirth').locator('button').click();
	await page.getByLabel('Choose the Year').selectOption('1996');
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByRole('button', { name: 'Tuesday, March 12th,' }).click();

	await page.getByTestId('form-item-contact.profession').locator('input').fill(EDIT_CANDIDATE.profession);
	await page.getByTestId('form-item-contact.gender').click();
	await page.getByRole('option', { name: EDIT_CANDIDATE.gender }).click();

	await page.getByTestId('form-item-contact.street').locator('input').fill('Main Street');
	await page.getByTestId('form-item-contact.number').locator('input').fill('42');
	await page.getByTestId('form-item-contact.city').locator('input').fill('Freetown');
	await page.getByTestId('form-item-contact.zip').locator('input').fill('1000');
	await page.getByTestId('form-item-contact.country').click();
	await page.getByRole('option', { name: EDIT_CANDIDATE.country }).click();

	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const prisma = await getPrismaClient();
	const row = await prisma.recipient.findFirst({
		where: {
			programId: null,
			contact: {
				firstName: EDIT_CANDIDATE.firstName,
				lastName: EDIT_CANDIDATE.lastName,
			},
		},
		select: {
			localPartner: { select: { name: true } },
		},
	});

	expect(row).toBeDefined();
	expect(row?.localPartner?.name).toBe(EDIT_CANDIDATE.localPartnerName);

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill('444444');
	await expect(page.getByRole('cell', { name: EDIT_CANDIDATE.phone })).toBeVisible();
});

test('Delete candidate', async ({ page }) => {
	const phone = '+23288765432';
	const firebaseService = await getFirebaseAdminService();
	await firebaseService.createByPhoneNumber(phone);

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill(phone);
	await expect(page.getByRole('cell', { name: phone })).toBeVisible();

	await page.goto('/portal/admin/candidates');
	await page.getByRole('cell', { name: 'Hawa' }).click();

	await page.getByRole('button', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Delete permanently' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const prisma = await getPrismaClient();
	const deleted = await prisma.recipient.findFirst({
		where: {
			programId: null,
			contact: {
				firstName: 'Hawa',
				lastName: 'Kamara',
			},
		},
		select: { id: true },
	});

	expect(deleted).toBeNull();

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill(phone);
	await expect(page.getByRole('cell', { name: phone })).toHaveCount(0);
});

test('CSV Upload', async ({ page }) => {
	await page.goto('/portal/admin/candidates');

	await page.getByTestId('data-table-actions-button').click();
	await page.getByTestId('data-table-action-item-upload-csv').click();
	await page.getByTestId('csv-dropzone-input').setInputFiles('./test/e2e/portal/admin/upload-example.csv');
	await page.getByTestId('import-button').click();

	await expect(page.getByText('Successfully imported 3 items.')).toBeVisible();

	const prisma = await getPrismaClient();

	for (const expected of CSV_CANDIDATES) {
		const row = await prisma.recipient.findFirst({
			where: {
				programId: null,
				contact: {
					firstName: expected.firstName,
					lastName: expected.lastName,
				},
			},
			select: {
				localPartner: { select: { name: true } },
			},
		});

		expect(row).toBeDefined();
		expect(row?.localPartner?.name).toBe(expected.localPartnerName);
	}
});
