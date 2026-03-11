import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
	clickDataTableActionItem,
	getCandidateByName,
	getFirebaseAdminService,
	selectOptionByTestId,
} from '../../../utils';

const ADD_CANDIDATE = {
	firstName: 'Clark',
	lastName: 'Kent',
	localPartnerName: 'Kenema Youth Foundation',
};

const PAYMENT_PHONE_ONE = '+23277000111';
const PAYMENT_PHONE_TWO = '+23277000112';

const openCandidateByName = async (page: Page, firstName: string) => {
	await page.goto(`/portal/admin/candidates?page=1&pageSize=10&search=${encodeURIComponent(firstName)}`);
	await page.getByRole('cell', { name: firstName }).click();
};

test.beforeEach(async () => {
	await seedDatabase();
});

test('add new candidate', async ({ page }) => {
	await page.goto('/portal/admin/candidates');
	await clickDataTableActionItem(page, 'data-table-action-item-add-new-candidate');
	await selectOptionByTestId(page, 'localPartner', ADD_CANDIDATE.localPartnerName);
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(ADD_CANDIDATE.firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(ADD_CANDIDATE.lastName);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const created = await getCandidateByName(ADD_CANDIDATE.firstName, ADD_CANDIDATE.lastName);
	expect(created).toBeDefined();
	expect(created?.localPartner?.name).toBe(ADD_CANDIDATE.localPartnerName);
});

test('shows uniqueness error when candidate email already exists', async ({ page }) => {
	const existingContact = await prisma.contact.findFirst({
		where: { email: { not: null } },
		select: { email: true },
	});
	expect(existingContact?.email).toBeTruthy();

	await page.goto('/portal/admin/candidates');
	await clickDataTableActionItem(page, 'data-table-action-item-add-new-candidate');
	await selectOptionByTestId(page, 'localPartner', ADD_CANDIDATE.localPartnerName);
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill('Duplicate');
	await page.getByTestId('form-item-contact.lastName').locator('input').fill('Email');
	await page.getByTestId('form-item-contact.email').locator('input').fill(existingContact!.email!);
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByText('A contact with this email already exists.')).toBeVisible();
});

test('candidate payment phone stays aligned in Firebase after phone changes', async ({ page }) => {
	const firebaseService = await getFirebaseAdminService();
	await firebaseService.deleteByPhoneNumberIfExists(PAYMENT_PHONE_ONE);
	await firebaseService.deleteByPhoneNumberIfExists(PAYMENT_PHONE_TWO);

	const candidate = await prisma.recipient.findFirst({
		where: { programId: null },
		select: {
			contact: {
				select: {
					firstName: true,
				},
			},
		},
	});
	expect(candidate).toBeTruthy();

	await openCandidateByName(page, candidate!.contact.firstName);
	await page.getByTestId('form-accordion-trigger-paymentInformation').click();
	await page.getByTestId('form-item-paymentInformation.phone').locator('input').fill(PAYMENT_PHONE_ONE);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	await page.goto('http://localhost:4000/auth');
	await page
		.getByPlaceholder('Search by user UID, email address, phone number, or display name')
		.fill(PAYMENT_PHONE_ONE);
	await expect(page.getByRole('cell', { name: PAYMENT_PHONE_ONE })).toBeVisible();

	await openCandidateByName(page, candidate!.contact.firstName);
	await page.getByTestId('form-accordion-trigger-paymentInformation').click();
	await page.getByTestId('form-item-paymentInformation.phone').locator('input').fill(PAYMENT_PHONE_TWO);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	await page.goto('http://localhost:4000/auth');
	await page
		.getByPlaceholder('Search by user UID, email address, phone number, or display name')
		.fill(PAYMENT_PHONE_TWO);
	await expect(page.getByRole('cell', { name: PAYMENT_PHONE_TWO })).toBeVisible();
	await page
		.getByPlaceholder('Search by user UID, email address, phone number, or display name')
		.fill(PAYMENT_PHONE_ONE);
	await expect(page.getByRole('cell', { name: PAYMENT_PHONE_ONE })).toHaveCount(0);
});

test('add candidate with payment phone keeps Firebase user in sync', async ({ page }) => {
	const firebaseService = await getFirebaseAdminService();
	const unique = Date.now();
	const firstName = `Candidate-${unique}`;
	const lastName = 'Firebase';
	const paymentPhone = `+23277${String(unique).slice(-6)}`;

	await firebaseService.deleteByPhoneNumberIfExists(paymentPhone);

	await page.goto('/portal/admin/candidates');
	await clickDataTableActionItem(page, 'data-table-action-item-add-new-candidate');
	await selectOptionByTestId(page, 'localPartner', ADD_CANDIDATE.localPartnerName);
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(lastName);
	await page.getByTestId('form-accordion-trigger-paymentInformation').click();
	await page.getByTestId('form-item-paymentInformation.phone').locator('input').fill(paymentPhone);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill(paymentPhone);
	await expect(page.getByRole('cell', { name: paymentPhone })).toBeVisible();

	const created = await getCandidateByName(firstName, lastName);
	expect(created).toBeDefined();
	expect(created?.paymentInformation?.phone?.number).toBe(paymentPhone);
});

test('delete candidate removes Firebase user for payment phone', async ({ page }) => {
	const firebaseService = await getFirebaseAdminService();
	const unique = Date.now();
	const firstName = `Delete-${unique}`;
	const lastName = 'Candidate';
	const paymentPhone = `+23277${String(unique).slice(-6)}`;

	await firebaseService.deleteByPhoneNumberIfExists(paymentPhone);
	await firebaseService.createByPhoneNumber(paymentPhone);

	const localPartner = await prisma.localPartner.findFirst({
		select: { id: true },
	});
	expect(localPartner?.id).toBeTruthy();

	await prisma.recipient.create({
		data: {
			localPartner: {
				connect: {
					id: localPartner!.id,
				},
			},
			contact: {
				create: {
					firstName,
					lastName,
					email: `candidate.delete.${unique}@example.com`,
				},
			},
			paymentInformation: {
				create: {
					phone: {
						create: {
							number: paymentPhone,
							hasWhatsApp: false,
						},
					},
				},
			},
		},
	});

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill(paymentPhone);
	await expect(page.getByRole('cell', { name: paymentPhone })).toBeVisible();

	await openCandidateByName(page, firstName);
	await page.getByRole('button', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Delete permanently' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const deletedCandidate = await getCandidateByName(firstName, lastName);
	expect(deletedCandidate).toBeNull();

	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill(paymentPhone);
	await expect(page.getByRole('cell', { name: paymentPhone })).toHaveCount(0);
});
