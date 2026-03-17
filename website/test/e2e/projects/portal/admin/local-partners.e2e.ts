import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { getFirebaseAdminService } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('admin local partners page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/local-partners');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin local partners with direct URL search matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/local-partners?page=1&pageSize=10&search=local-partner-2');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin local partners with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/local-partners?page=1&pageSize=10&sortBy=name&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('add new local partner', async ({ page }) => {
	const unique = Date.now();
	const partnerName = `e2e-local-partner-${unique}`;
	const email = `e2e.local.partner.${unique}@example.com`;

	await page.goto('/portal/admin/local-partners');
	await page.getByTestId('data-table-actions-button').click();
	await page.getByTestId('data-table-action-item-add-new-local-partner').click();

	await page.getByTestId('form-item-name').locator('input').fill(partnerName);
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill('E2E');
	await page.getByTestId('form-item-contact.lastName').locator('input').fill('Partner');
	await page.getByTestId('form-item-contact.email').locator('input').fill(email);
	await page.getByTestId('form-item-contact.phone').locator('input').fill('+41791230001');
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const created = await prisma.localPartner.findUnique({
		where: { name: partnerName },
		select: {
			id: true,
			contact: {
				select: {
					email: true,
					phone: { select: { number: true } },
				},
			},
		},
	});

	expect(created).toBeDefined();
	expect(created?.contact.email).toBe(email);
	expect(created?.contact.phone?.number).toBe('+41791230001');
});

test('shows uniqueness error when email already exists', async ({ page }) => {
	await page.goto('/portal/admin/local-partners');
	await page.getByTestId('data-table-actions-button').click();
	await page.getByTestId('data-table-action-item-add-new-local-partner').click();

	await page.getByTestId('form-item-name').locator('input').fill(`e2e-duplicate-email-${Date.now()}`);
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill('Dup');
	await page.getByTestId('form-item-contact.lastName').locator('input').fill('Email');
	await page.getByTestId('form-item-contact.email').locator('input').fill('test@portal.org');
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByText('A contact with this email already exists.')).toBeVisible();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();
});

test('edit local partner and remove phone number', async ({ page }) => {
	const unique = Date.now();
	const partnerName = `e2e-remove-phone-${unique}`;
	const email = `e2e.remove.phone.${unique}@example.com`;
	const initialPhone = '+41791230002';

	await prisma.localPartner.create({
		data: {
			name: partnerName,
			causes: [],
			account: {
				create: {
					firebaseAuthUserId: `e2e-local-partner-uid-${unique}`,
				},
			},
			contact: {
				create: {
					firstName: 'Phone',
					lastName: 'Removal',
					email,
					phone: {
						create: {
							number: initialPhone,
							hasWhatsApp: true,
						},
					},
				},
			},
		},
	});

	await page.goto('/portal/admin/local-partners');
	await page.getByRole('cell', { name: partnerName }).click();

	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.phone').locator('input').clear();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const updated = await prisma.localPartner.findUnique({
		where: { name: partnerName },
		select: {
			contact: {
				select: {
					phoneId: true,
				},
			},
		},
	});

	expect(updated?.contact.phoneId).toBeNull();

	const removedPhone = await prisma.phone.findUnique({
		where: { number: initialPhone },
		select: { id: true },
	});
	expect(removedPhone).toBeNull();
});

test('edit local partner and remove address', async ({ page }) => {
	const unique = Date.now();
	const partnerName = `e2e-remove-address-${unique}`;
	const email = `e2e.remove.address.${unique}@example.com`;

	const created = await prisma.localPartner.create({
		data: {
			name: partnerName,
			causes: [],
			account: {
				create: {
					firebaseAuthUserId: `e2e-local-partner-uid-address-${unique}`,
				},
			},
			contact: {
				create: {
					firstName: 'Address',
					lastName: 'Removal',
					email,
					address: {
						create: {
							street: 'Address Street',
							number: '7',
							city: 'Zurich',
							zip: '8000',
						},
					},
				},
			},
		},
		select: {
			id: true,
			contact: {
				select: {
					addressId: true,
				},
			},
		},
	});
	expect(created.contact.addressId).toBeTruthy();

	await page.goto('/portal/admin/local-partners');
	await page.getByRole('cell', { name: partnerName }).click();
	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.street').locator('input').clear();
	await page.getByTestId('form-item-contact.number').locator('input').clear();
	await page.getByTestId('form-item-contact.city').locator('input').clear();
	await page.getByTestId('form-item-contact.zip').locator('input').clear();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const updated = await prisma.localPartner.findUniqueOrThrow({
		where: { id: created.id },
		select: {
			contact: {
				select: {
					addressId: true,
				},
			},
		},
	});
	expect(updated.contact.addressId).toBeNull();

	const deletedAddress = await prisma.address.findUnique({
		where: { id: created.contact.addressId! },
		select: { id: true },
	});
	expect(deletedAddress).toBeNull();
});

test('delete local partner from admin table', async ({ page }) => {
	const unique = Date.now();
	const partnerName = `e2e-delete-partner-${unique}`;
	const email = `e2e.delete.partner.${unique}@example.com`;

	const created = await prisma.localPartner.create({
		data: {
			name: partnerName,
			causes: [],
			account: {
				create: {
					firebaseAuthUserId: `e2e-delete-local-partner-uid-${unique}`,
				},
			},
			contact: {
				create: {
					firstName: 'Delete',
					lastName: 'Me',
					email,
				},
			},
		},
		select: {
			id: true,
			contactId: true,
			accountId: true,
		},
	});

	await page.goto('/portal/admin/local-partners');
	await page.getByRole('cell', { name: partnerName }).click();
	await page.getByRole('button', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Delete permanently' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const deletedPartner = await prisma.localPartner.findUnique({
		where: { id: created.id },
		select: { id: true },
	});
	const deletedContact = await prisma.contact.findUnique({
		where: { id: created.contactId },
		select: { id: true },
	});
	const deletedAccount = await prisma.account.findUnique({
		where: { id: created.accountId },
		select: { id: true },
	});

	expect(deletedPartner).toBeNull();
	expect(deletedContact).toBeNull();
	expect(deletedAccount).toBeNull();
});

test('local partner create update delete keeps Firebase user in sync', async ({ page }) => {
	const firebaseService = await getFirebaseAdminService();
	const unique = Date.now();
	const partnerName = `e2e-firebase-partner-${unique}`;
	const initialFirstName = 'Firebase';
	const initialLastName = 'Create';
	const initialEmail = `e2e.firebase.create.${unique}@example.com`;
	const updatedFirstName = 'Firebase';
	const updatedLastName = 'Updated';
	const updatedEmail = `e2e.firebase.updated.${unique}@example.com`;
	const openPartnerByName = async (name: string) => {
		await page.goto(`/portal/admin/local-partners?page=1&pageSize=10&search=${encodeURIComponent(name)}`);
		await page.getByRole('cell', { name }).click();
	};

	await page.goto('/portal/admin/local-partners');
	await page.getByTestId('data-table-actions-button').click();
	await page.getByTestId('data-table-action-item-add-new-local-partner').click();
	await page.getByTestId('form-item-name').locator('input').fill(partnerName);
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

	await openPartnerByName(partnerName);
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

	await openPartnerByName(partnerName);
	await page.getByRole('button', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Delete permanently' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const firebaseDeletedResult = await firebaseService.getByEmail(updatedEmail);
	expect(firebaseDeletedResult.success).toBeTruthy();
	if (!firebaseDeletedResult.success) {
		throw new Error(firebaseDeletedResult.error);
	}
	expect(firebaseDeletedResult.data).toBeNull();
});
