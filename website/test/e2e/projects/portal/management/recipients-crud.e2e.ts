import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import {
	assertContactExistsByEmail,
	clickDataTableActionItem,
	getFirebaseAdminService,
	getRecipientIdByName,
	getRecipientProgramAndLocalPartnerByName,
	selectOptionByTestId,
} from '../../../utils';

const ADD_RECIPIENT = {
	firstName: 'Tony',
	lastName: 'Stark',
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
	paymentProvider: 'Orange Money',
	paymentCode: 'OM123456',
	country: 'Sierra Leone',
};

const buildUnusedPaymentPhoneNumbers = async () => {
	const phones: string[] = [];
	let counter = Date.now() % 100000;

	while (phones.length < 2) {
		counter += 1;
		const nextPhone = `+23277${String(counter).padStart(6, '0')}`;
		const existing = await prisma.phone.findUnique({
			where: { number: nextPhone },
			select: { id: true },
		});
		if (!existing) {
			phones.push(nextPhone);
		}
	}

	return {
		first: phones[0],
		second: phones[1],
	};
};

const CSV_RECIPIENTS = [
	{
		firstName: 'Bruce',
		lastName: 'Banner',
		programName: 'Migros Relief SL',
		localPartnerName: 'Makeni Development Initiative',
	},
	{
		firstName: 'Natasha',
		lastName: 'Romanoff',
		programName: 'Migros Relief SL',
		localPartnerName: 'Makeni Development Initiative',
	},
	{
		firstName: 'Clint',
		lastName: 'Barton',
		programName: 'Migros Education SL',
		localPartnerName: 'Bo Women Empowerment Group',
	},
];

const expectedCsvExport = {
	snapshotFile: 'recipients-export.csv',
};

test.beforeEach(async () => {
	await seedDatabase();
});

test('Add new recipient', async ({ page }) => {
	await assertContactExistsByEmail('test@portal.org');

	await page.goto('/portal/management/recipients');
	await clickDataTableActionItem(page, 'data-table-action-item-add-new-recipient');

	await selectOptionByTestId(page, 'program', ADD_RECIPIENT.programName);
	await selectOptionByTestId(page, 'localPartner', ADD_RECIPIENT.localPartnerName);

	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(ADD_RECIPIENT.firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(ADD_RECIPIENT.lastName);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const row = await getRecipientProgramAndLocalPartnerByName(ADD_RECIPIENT.firstName, ADD_RECIPIENT.lastName);

	expect(row).toBeDefined();
	expect(row?.program?.name).toBe(ADD_RECIPIENT.programName);
	expect(row?.localPartner?.name).toBe(ADD_RECIPIENT.localPartnerName);
});

test('Edit existing recipient', async ({ page }) => {
	const firebaseService = await getFirebaseAdminService();
	await firebaseService.deleteByPhoneNumberIfExists(EDIT_RECIPIENT.phone);

	await page.goto('/portal/management/recipients');
	await page.getByRole('cell', { name: 'Sahr' }).click();

	await page.getByTestId('form-item-startDate').locator('button').click();
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByLabel('Choose the Year').selectOption('2020');
	await page.getByRole('button', { name: 'Thursday, March 12th,' }).click();
	await page.getByTestId('form-item-successorName').locator('input').fill(EDIT_RECIPIENT.successorName);
	await page.getByTestId('form-item-termsAccepted').locator('button').click();
	await selectOptionByTestId(page, 'program', EDIT_RECIPIENT.programName);
	await selectOptionByTestId(page, 'localPartner', EDIT_RECIPIENT.localPartnerName);
	await page.getByTestId('form-accordion-trigger-paymentInformation').click();
	await selectOptionByTestId(page, 'paymentInformation.provider', EDIT_RECIPIENT.paymentProvider);
	await page.getByTestId('form-item-paymentInformation.code').locator('input').fill(EDIT_RECIPIENT.paymentCode);
	await page.getByTestId('form-item-paymentInformation.phone').locator('input').fill(EDIT_RECIPIENT.phone);
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(EDIT_RECIPIENT.firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(EDIT_RECIPIENT.lastName);
	await page.getByTestId('form-item-contact.callingName').locator('input').fill(EDIT_RECIPIENT.callingName);
	await page.getByTestId('form-item-contact.email').locator('input').fill(EDIT_RECIPIENT.email);
	await selectOptionByTestId(page, 'contact.language', EDIT_RECIPIENT.language);
	await page.getByTestId('form-item-contact.dateOfBirth').locator('button').click();
	await page.getByLabel('Choose the Year').selectOption('1996');
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByRole('button', { name: 'Tuesday, March 12th,' }).click();
	await page.getByTestId('form-item-contact.profession').locator('input').fill(EDIT_RECIPIENT.profession);
	await selectOptionByTestId(page, 'contact.gender', EDIT_RECIPIENT.gender);
	await page.getByTestId('form-item-contact.street').locator('input').fill('Main Street');
	await page.getByTestId('form-item-contact.number').locator('input').fill('42');
	await page.getByTestId('form-item-contact.city').locator('input').fill('Freetown');
	await page.getByTestId('form-item-contact.zip').locator('input').fill('1000');
	await selectOptionByTestId(page, 'contact.country', EDIT_RECIPIENT.country);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const row = await getRecipientProgramAndLocalPartnerByName(EDIT_RECIPIENT.firstName, EDIT_RECIPIENT.lastName);

	expect(row).toBeDefined();
	expect(row?.program?.name).toBe(EDIT_RECIPIENT.programName);
	expect(row?.localPartner?.name).toBe(EDIT_RECIPIENT.localPartnerName);

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill('666666');
	await expect(page.getByRole('cell', { name: EDIT_RECIPIENT.phone })).toBeVisible();
});

test('shows uniqueness error when recipient email already exists', async ({ page }) => {
	const existingContact = await prisma.contact.findFirst({
		where: { email: { not: null } },
		select: { email: true },
	});
	expect(existingContact?.email).toBeTruthy();

	await page.goto('/portal/management/recipients');
	await clickDataTableActionItem(page, 'data-table-action-item-add-new-recipient');
	await selectOptionByTestId(page, 'program', ADD_RECIPIENT.programName);
	await selectOptionByTestId(page, 'localPartner', ADD_RECIPIENT.localPartnerName);
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill('Duplicate');
	await page.getByTestId('form-item-contact.lastName').locator('input').fill('Recipient');
	await page.getByTestId('form-item-contact.email').locator('input').fill(existingContact!.email!);
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByText('A contact with this email already exists.')).toBeVisible();
});

test('shows uniqueness error when recipient payment code already exists', async ({ page }) => {
	const existingPaymentInfo = await prisma.paymentInformation.findFirst({
		where: { code: { not: null } },
		select: { code: true },
	});
	expect(existingPaymentInfo?.code).toBeTruthy();

	await page.goto('/portal/management/recipients');
	await clickDataTableActionItem(page, 'data-table-action-item-add-new-recipient');
	await selectOptionByTestId(page, 'program', ADD_RECIPIENT.programName);
	await selectOptionByTestId(page, 'localPartner', ADD_RECIPIENT.localPartnerName);
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill('Duplicate');
	await page.getByTestId('form-item-contact.lastName').locator('input').fill('PaymentCode');
	await page.getByTestId('form-accordion-trigger-paymentInformation').click();
	await page.getByTestId('form-item-paymentInformation.code').locator('input').fill(existingPaymentInfo!.code!);
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByText('A payment code with this value already exists.')).toBeVisible();
});

test.only('recipient payment phone stays aligned in Firebase after phone changes', async ({ page }) => {
	const unusedPhones = await buildUnusedPaymentPhoneNumbers();
	const firebaseService = await getFirebaseAdminService();
	await firebaseService.deleteByPhoneNumberIfExists(unusedPhones.first);
	await firebaseService.deleteByPhoneNumberIfExists(unusedPhones.second);

	const existingRecipient = await prisma.recipient.findFirst({
		where: { programId: { not: null } },
		select: {
			contact: {
				select: {
					firstName: true,
				},
			},
			paymentInformation: {
				select: {
					phone: {
						select: {
							number: true,
						},
					},
				},
			},
		},
	});
	expect(existingRecipient).toBeTruthy();
	expect(existingRecipient?.paymentInformation?.phone?.number).toBeTruthy();

	await firebaseService.createByPhoneNumber(existingRecipient!.paymentInformation!.phone!.number);

	await page.goto(
		`/portal/management/recipients?page=1&pageSize=10&search=${encodeURIComponent(existingRecipient!.contact.firstName)}`,
	);
	await page.getByRole('cell', { name: existingRecipient!.contact.firstName }).click();
	await selectOptionByTestId(page, 'contact.language', 'en');
	await page.getByTestId('form-accordion-trigger-paymentInformation').click();
	await page.getByTestId('form-item-paymentInformation.phone').locator('input').fill(unusedPhones.first);
	await page.getByRole('button', { name: 'Save' }).click();
	await Promise.race([
		page.getByTestId('dynamic-form').waitFor({ state: 'detached' }),
		page.getByText('Error saving recipient:').waitFor({ state: 'visible' }),
	]);
	if (await page.getByTestId('dynamic-form').isVisible()) {
		const errorText = await page.getByText('Error saving recipient:').first().textContent();
		throw new Error(`Recipient save failed before first phone update: ${errorText ?? 'Unknown error'}`);
	}

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill(unusedPhones.first);
	await expect(page.getByRole('cell', { name: unusedPhones.first })).toBeVisible();

	await page.goto(
		`/portal/management/recipients?page=1&pageSize=10&search=${encodeURIComponent(existingRecipient!.contact.firstName)}`,
	);
	await page.getByRole('cell', { name: existingRecipient!.contact.firstName }).click();
	await selectOptionByTestId(page, 'contact.language', 'en');
	await page.getByTestId('form-accordion-trigger-paymentInformation').click();
	await page.getByTestId('form-item-paymentInformation.phone').locator('input').fill(unusedPhones.second);
	await page.getByRole('button', { name: 'Save' }).click();
	await Promise.race([
		page.getByTestId('dynamic-form').waitFor({ state: 'detached' }),
		page.getByText('Error saving recipient:').waitFor({ state: 'visible' }),
	]);
	if (await page.getByTestId('dynamic-form').isVisible()) {
		const errorText = await page.getByText('Error saving recipient:').first().textContent();
		throw new Error(`Recipient save failed before second phone update: ${errorText ?? 'Unknown error'}`);
	}

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill(unusedPhones.second);
	await expect(page.getByRole('cell', { name: unusedPhones.second })).toBeVisible();
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill(unusedPhones.first);
	await expect(page.getByRole('cell', { name: unusedPhones.first })).toHaveCount(0);
});

test('Delete recipient', async ({ page }) => {
	const phone = '+23277111222';
	const firebaseService = await getFirebaseAdminService();
	await firebaseService.createByPhoneNumber(phone);

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill(phone);
	await expect(page.getByRole('cell', { name: phone })).toBeVisible();

	await page.goto('/portal/management/recipients');
	await page.getByRole('cell', { name: 'Sahr' }).click();
	await page.getByRole('button', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Delete permanently' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const deleted = await getRecipientIdByName('Sahr', 'Koroma');

	expect(deleted).toBeNull();

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill(phone);
	await expect(page.getByRole('cell', { name: phone })).toHaveCount(0);
});

test('CSV Upload', async ({ page }) => {
	await page.goto('/portal/management/recipients');
	await clickDataTableActionItem(page, 'data-table-action-item-upload-csv');
	await page
		.getByTestId('csv-dropzone-input')
		.setInputFiles('./test/e2e/projects/portal/management/upload-example.csv');
	await page.getByTestId('import-button').click();
	await expect(page.getByText('Successfully imported 3 items.')).toBeVisible();

	for (const expected of CSV_RECIPIENTS) {
		const row = await getRecipientProgramAndLocalPartnerByName(expected.firstName, expected.lastName);
		expect(row).toBeDefined();
		expect(row?.program?.name).toBe(expected.programName);
		expect(row?.localPartner?.name).toBe(expected.localPartnerName);
	}
});

test('CSV Export', async ({ page }) => {
	await page.goto('/portal/management/recipients');

	const downloadPromise = page.waitForEvent('download');
	await clickDataTableActionItem(page, 'data-table-action-item-download-csv');
	const download = await downloadPromise;

	expect(download.suggestedFilename()).toMatch(/^recipients-export-\d{4}-\d{2}-\d{2}\.csv$/);

	const downloadPath = await download.path();
	expect(downloadPath).toBeTruthy();

	const csvContent = await readFile(downloadPath!, 'utf8');
	expect(csvContent).toMatchSnapshot(expectedCsvExport.snapshotFile);
});
