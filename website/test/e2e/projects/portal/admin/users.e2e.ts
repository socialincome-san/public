import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, Page, test } from '@playwright/test';
import { getFirebaseAdminService } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

const selectFormOptionByTestId = async (page: Page, fieldName: string, optionName?: string) => {
	const trigger = page.getByTestId(`form-item-${fieldName}`).locator('button');
	await trigger.first().click();
	if (optionName) {
		await page.getByRole('option', { name: optionName }).click();
		return;
	}
	await page.getByRole('option').first().click();
};

test('admin users page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/users');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin users with direct URL search matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/users?page=1&pageSize=10&search=test%40portal.org');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin users with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/users?page=1&pageSize=10&sortBy=role&sortDirection=desc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test.only('add new user keeps Firebase user in sync', async ({ page }) => {
	const firebaseService = await getFirebaseAdminService();
	const unique = Date.now();
	const firstName = 'E2E';
	const lastName = 'User';
	const email = `e2e.user.create.${unique}@example.com`;

	await page.goto('/portal/admin/users');
	await page.getByTestId('data-table-actions-button').click();
	await page.getByTestId('data-table-action-item-add-user').click();
	await page.getByTestId('form-item-firstName').locator('input').fill(firstName);
	await page.getByTestId('form-item-lastName').locator('input').fill(lastName);
	await page.getByTestId('form-item-email').locator('input').fill(email);
	await selectFormOptionByTestId(page, 'role', 'user');
	await selectFormOptionByTestId(page, 'organizationId');
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const created = await prisma.user.findFirst({
		where: { contact: { email } },
		select: {
			id: true,
			role: true,
			activeOrganizationId: true,
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
	expect(created?.activeOrganizationId).toBeTruthy();

	const firebaseCreatedResult = await firebaseService.getByEmail(email);
	expect(firebaseCreatedResult.success).toBeTruthy();
	if (!firebaseCreatedResult.success) {
		throw new Error(firebaseCreatedResult.error);
	}
	expect(firebaseCreatedResult.data).toBeTruthy();
	expect(firebaseCreatedResult.data?.displayName).toBe(`${firstName} ${lastName}`);
});

test.only('shows uniqueness error when user email already exists', async ({ page }) => {
	await page.goto('/portal/admin/users');
	await page.getByTestId('data-table-actions-button').click();
	await page.getByTestId('data-table-action-item-add-user').click();
	await page.getByTestId('form-item-firstName').locator('input').fill('Dup');
	await page.getByTestId('form-item-lastName').locator('input').fill('User');
	await page.getByTestId('form-item-email').locator('input').fill('test@portal.org');
	await selectFormOptionByTestId(page, 'role', 'user');
	await selectFormOptionByTestId(page, 'organizationId');
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByText('A user with this email already exists.')).toBeVisible();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();
});

test.only('update user keeps Firebase user in sync', async ({ page }) => {
	const firebaseService = await getFirebaseAdminService();
	const unique = Date.now();
	const initialFirstName = 'Firebase';
	const initialLastName = 'User';
	const initialEmail = `e2e.user.firebase.initial.${unique}@example.com`;
	const updatedFirstName = 'Updated';
	const updatedLastName = 'User';
	const updatedEmail = `e2e.user.firebase.updated.${unique}@example.com`;

	const openUserByEmail = async (email: string) => {
		await page.goto(`/portal/admin/users?page=1&pageSize=10&search=${encodeURIComponent(email)}`);
		await page.getByRole('cell', { name: email }).click();
	};

	await page.goto('/portal/admin/users');
	await page.getByTestId('data-table-actions-button').click();
	await page.getByTestId('data-table-action-item-add-user').click();
	await page.getByTestId('form-item-firstName').locator('input').fill(initialFirstName);
	await page.getByTestId('form-item-lastName').locator('input').fill(initialLastName);
	await page.getByTestId('form-item-email').locator('input').fill(initialEmail);
	await selectFormOptionByTestId(page, 'role', 'user');
	await selectFormOptionByTestId(page, 'organizationId');
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const firebaseCreatedResult = await firebaseService.getByEmail(initialEmail);
	expect(firebaseCreatedResult.success).toBeTruthy();
	if (!firebaseCreatedResult.success) {
		throw new Error(firebaseCreatedResult.error);
	}
	expect(firebaseCreatedResult.data).toBeTruthy();
	expect(firebaseCreatedResult.data?.displayName).toBe(`${initialFirstName} ${initialLastName}`);

	await openUserByEmail(initialEmail);
	await page.getByTestId('form-item-firstName').locator('input').fill(updatedFirstName);
	await page.getByTestId('form-item-lastName').locator('input').fill(updatedLastName);
	await page.getByTestId('form-item-email').locator('input').fill(updatedEmail);
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
