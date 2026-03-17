import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { clickDataTableActionItem, getFirebaseAdminService } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('add new contributor', async ({ page }) => {
	const unique = Date.now();
	const firstName = 'Bruce';
	const lastName = 'Wayne';
	const email = `contributors.e2e.${unique}@example.com`;

	await page.goto('/portal/management/contributors');
	await clickDataTableActionItem(page, 'data-table-action-item-add-new-contributor');
	await page.getByTestId('form-item-referral').locator('button').click();
	await page.getByRole('option', { name: 'other' }).click();
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(lastName);
	await page.getByTestId('form-item-contact.email').locator('input').fill(email);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const created = await prisma.contributor.findFirst({
		where: {
			contact: {
				email,
			},
		},
		select: {
			id: true,
			referral: true,
			contact: {
				select: {
					firstName: true,
					lastName: true,
					email: true,
				},
			},
		},
	});
	expect(created).toBeDefined();
	expect(created?.contact.firstName).toBe(firstName);
	expect(created?.contact.lastName).toBe(lastName);
	expect(created?.contact.email).toBe(email);
	expect(created?.referral).toBe('other');
});

test('shows uniqueness error when contributor email already exists', async ({ page }) => {
	const existingContact = await prisma.contact.findFirst({
		where: { email: { not: null } },
		select: { email: true },
	});
	expect(existingContact?.email).toBeTruthy();

	await page.goto('/portal/management/contributors');
	await clickDataTableActionItem(page, 'data-table-action-item-add-new-contributor');
	await page.getByTestId('form-item-referral').locator('button').click();
	await page.getByRole('option', { name: 'other' }).click();
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill('Duplicate');
	await page.getByTestId('form-item-contact.lastName').locator('input').fill('Email');
	await page.getByTestId('form-item-contact.email').locator('input').fill(existingContact!.email!);
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByText('Error saving contributor: A contact with this email already exists.')).toBeVisible();
});

test('shows uniqueness error when contributor phone already exists', async ({ page }) => {
	const existingPhone = await prisma.phone.findFirst({
		where: {
			contacts: {
				some: {},
			},
		},
		select: { number: true },
	});
	expect(existingPhone?.number).toBeTruthy();

	await page.goto('/portal/management/contributors');
	await clickDataTableActionItem(page, 'data-table-action-item-add-new-contributor');
	await page.getByTestId('form-item-referral').locator('button').click();
	await page.getByRole('option', { name: 'other' }).click();
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill('Duplicate');
	await page.getByTestId('form-item-contact.lastName').locator('input').fill('Phone');
	await page.getByTestId('form-item-contact.email').locator('input').fill(`dup.phone.${Date.now()}@example.com`);
	await page.getByTestId('form-item-contact.phone').locator('input').fill(existingPhone!.number);
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByText('Error saving contributor: A contact with this phone number already exists.')).toBeVisible();
});

test('edit contributor and remove phone and address', async ({ page }) => {
	const unique = Date.now();
	const firstName = `Edge-${unique}`;
	const lastName = 'Contributor';
	const email = `edge.contrib.${unique}@example.com`;
	const phone = `+4179${String(unique).slice(-7)}`;

	const created = await prisma.contributor.create({
		data: {
			referral: 'other',
			account: {
				create: {
					firebaseAuthUserId: `e2e-contributor-uid-${unique}`,
				},
			},
			contact: {
				create: {
					firstName,
					lastName,
					email,
					phone: {
						create: {
							number: phone,
							hasWhatsApp: true,
						},
					},
					address: {
						create: {
							street: 'Address Street',
							number: '10',
							city: 'Bern',
							zip: '3000',
						},
					},
				},
			},
		},
		select: {
			id: true,
			contact: {
				select: {
					phoneId: true,
					addressId: true,
				},
			},
		},
	});

	expect(created.contact.phoneId).toBeTruthy();
	expect(created.contact.addressId).toBeTruthy();

	await page.goto(`/portal/management/contributors?page=1&pageSize=10&search=${encodeURIComponent(firstName)}`);
	await page.getByRole('cell', { name: firstName }).click();
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.phone').locator('input').clear();
	await page.getByTestId('form-item-contact.street').locator('input').clear();
	await page.getByTestId('form-item-contact.number').locator('input').clear();
	await page.getByTestId('form-item-contact.city').locator('input').clear();
	await page.getByTestId('form-item-contact.zip').locator('input').clear();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const updated = await prisma.contributor.findUniqueOrThrow({
		where: { id: created.id },
		select: {
			contact: {
				select: {
					phoneId: true,
					addressId: true,
				},
			},
		},
	});
	expect(updated.contact.phoneId).toBeNull();
	expect(updated.contact.addressId).toBeNull();

	const deletedPhone = await prisma.phone.findUnique({
		where: { id: created.contact.phoneId! },
		select: { id: true },
	});
	const deletedAddress = await prisma.address.findUnique({
		where: { id: created.contact.addressId! },
		select: { id: true },
	});
	expect(deletedPhone).toBeNull();
	expect(deletedAddress).toBeNull();
});

test('contributor create and update keeps Firebase user in sync', async ({ page }) => {
	const firebaseService = await getFirebaseAdminService();
	const unique = Date.now();
	const initialFirstName = 'Firebase';
	const initialLastName = 'Contributor';
	const initialEmail = `e2e.contributor.firebase.initial.${unique}@example.com`;
	const updatedFirstName = 'Updated';
	const updatedLastName = 'Contributor';
	const updatedEmail = `e2e.contributor.firebase.updated.${unique}@example.com`;

	const openContributorByEmail = async (email: string) => {
		await page.goto(`/portal/management/contributors?page=1&pageSize=10&search=${encodeURIComponent(email)}`);
		await page.getByRole('cell', { name: email }).click();
	};

	await page.goto('/portal/management/contributors');
	await clickDataTableActionItem(page, 'data-table-action-item-add-new-contributor');
	await page.getByTestId('form-item-referral').locator('button').click();
	await page.getByRole('option', { name: 'other' }).click();
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(initialFirstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(initialLastName);
	await page.getByTestId('form-item-contact.email').locator('input').fill(initialEmail);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const firebaseCreatedResult = await firebaseService.getByEmail(initialEmail);
	expect(firebaseCreatedResult.success).toBeTruthy();
	if (!firebaseCreatedResult.success) {
		throw new Error(firebaseCreatedResult.error);
	}
	expect(firebaseCreatedResult.data).toBeTruthy();
	expect(firebaseCreatedResult.data?.displayName).toBe(`${initialFirstName} ${initialLastName}`);

	await openContributorByEmail(initialEmail);
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(updatedFirstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(updatedLastName);
	await page.getByTestId('form-item-contact.email').locator('input').fill(updatedEmail);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const firebaseOldEmailResult = await firebaseService.getByEmail(initialEmail);
	expect(firebaseOldEmailResult.success).toBeTruthy();
	if (!firebaseOldEmailResult.success) {
		throw new Error(firebaseOldEmailResult.error);
	}
	expect(firebaseOldEmailResult.data).toBeNull();

	const firebaseUpdatedResult = await firebaseService.getByEmail(updatedEmail);
	expect(firebaseUpdatedResult.success).toBeTruthy();
	if (!firebaseUpdatedResult.success) {
		throw new Error(firebaseUpdatedResult.error);
	}
	expect(firebaseUpdatedResult.data).toBeTruthy();
	expect(firebaseUpdatedResult.data?.displayName).toBe(`${updatedFirstName} ${updatedLastName}`);
});
