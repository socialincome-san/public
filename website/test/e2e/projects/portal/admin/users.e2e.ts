import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import {
import { expectToHaveScreenshot } from '../../../utils';
	clickDataTableActionItem,
	getFirebaseAdminService,
	selectMultiOptionsByTestId,
	selectOptionByTestId,
} from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('admin users page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/users?sortBy=email&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test('admin users with direct URL search matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/users?page=1&pageSize=10&sortBy=email&sortDirection=asc&search=test%40portal.org');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test('admin users with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/users?page=1&pageSize=10&sortBy=role&sortDirection=desc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test('admin users can show and search by Firebase auth user ID', async ({ page }) => {
	const seededUser = await prisma.user.findFirst({
		where: { contact: { email: 'test@portal.org' } },
		select: {
			contact: {
				select: {
					email: true,
				},
			},
			account: {
				select: {
					firebaseAuthUserId: true,
				},
			},
		},
	});
	expect(seededUser).toBeDefined();
	expect(seededUser?.contact.email).toBeTruthy();
	expect(seededUser?.account.firebaseAuthUserId).toBeTruthy();

	const seededEmail = seededUser?.contact.email ?? '';
	const seededFirebaseAuthUserId = seededUser?.account.firebaseAuthUserId ?? '';

	await page.goto('/portal/admin/users');
	await expect(page.getByTestId('data-table')).toBeVisible();

	await expect(page.getByTitle(seededFirebaseAuthUserId, { exact: true })).toHaveCount(0);

	await page.getByTestId('data-table-columns-button').click();
	await page.getByTestId('data-table-column-firebaseAuthUserId-toggle').click();
	await page.keyboard.press('Escape');

	await expect(page.getByTitle(seededFirebaseAuthUserId, { exact: true })).toBeVisible();

	await page.goto(`/portal/admin/users?page=1&pageSize=10&search=${encodeURIComponent(seededFirebaseAuthUserId)}`);
	await expect(page.getByRole('cell', { name: seededEmail, exact: true })).toBeVisible();
});

test('add new user keeps Firebase user in sync', async ({ page }) => {
	const firebaseService = await getFirebaseAdminService();
	const unique = Date.now();
	const firstName = 'E2E';
	const lastName = 'User';
	const email = `e2e.user.create.${unique}@example.com`;
	const editOrganizationName = 'Migros';
	const readonlyOrganizationName = 'Coop';

	await page.goto('/portal/admin/users');
	await clickDataTableActionItem(page, 'data-table-action-item-add-user');
	await page.getByTestId('form-item-firstName').locator('input').fill(firstName);
	await page.getByTestId('form-item-lastName').locator('input').fill(lastName);
	await page.getByTestId('form-item-email').locator('input').fill(email);
	await selectOptionByTestId(page, 'role', 'user');
	await selectMultiOptionsByTestId(page, 'editOrganizations', [editOrganizationName]);
	await selectMultiOptionsByTestId(page, 'readonlyOrganizations', [readonlyOrganizationName]);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const created = await prisma.user.findFirst({
		where: { contact: { email } },
		select: {
			id: true,
			role: true,
			activeOrganizationId: true,
			organizationAccesses: {
				select: {
					permission: true,
					organization: {
						select: {
							name: true,
						},
					},
				},
			},
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
	expect(created?.organizationAccesses).toEqual(
		expect.arrayContaining([
			expect.objectContaining({ permission: 'edit', organization: expect.objectContaining({ name: editOrganizationName }) }),
			expect.objectContaining({
				permission: 'readonly',
				organization: expect.objectContaining({ name: readonlyOrganizationName }),
			}),
		]),
	);

	const firebaseCreatedResult = await firebaseService.getByEmail(email);
	expect(firebaseCreatedResult.success).toBeTruthy();
	if (!firebaseCreatedResult.success) {
		throw new Error(firebaseCreatedResult.error);
	}
	expect(firebaseCreatedResult.data).toBeTruthy();
	expect(firebaseCreatedResult.data?.displayName).toBe(`${firstName} ${lastName}`);
});

test('shows uniqueness error when user email already exists', async ({ page }) => {
	await page.goto('/portal/admin/users');
	await clickDataTableActionItem(page, 'data-table-action-item-add-user');
	await page.getByTestId('form-item-firstName').locator('input').fill('Dup');
	await page.getByTestId('form-item-lastName').locator('input').fill('User');
	await page.getByTestId('form-item-email').locator('input').fill('test@portal.org');
	await selectOptionByTestId(page, 'role', 'user');
	await selectMultiOptionsByTestId(page, 'editOrganizations', ['Migros']);
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByText('A user with this email already exists.')).toBeVisible();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();
});

test('update user keeps Firebase user in sync', async ({ page }) => {
	const firebaseService = await getFirebaseAdminService();
	const unique = Date.now();
	const initialFirstName = 'Firebase';
	const initialLastName = 'User';
	const initialEmail = `e2e.user.firebase.initial.${unique}@example.com`;
	const updatedFirstName = 'Updated';
	const updatedLastName = 'User';
	const updatedEmail = `e2e.user.firebase.updated.${unique}@example.com`;
	const initialEditOrganizationName = 'Migros';
	const initialReadonlyOrganizationName = 'Coop';
	const updatedEditOrganizationName = 'Coop';
	const updatedReadonlyOrganizationName = 'Migros';

	const openUserByEmail = async (email: string) => {
		await page.goto(`/portal/admin/users?page=1&pageSize=10&search=${encodeURIComponent(email)}`);
		await page.getByRole('cell', { name: email }).click();
	};

	await page.goto('/portal/admin/users');
	await clickDataTableActionItem(page, 'data-table-action-item-add-user');
	await page.getByTestId('form-item-firstName').locator('input').fill(initialFirstName);
	await page.getByTestId('form-item-lastName').locator('input').fill(initialLastName);
	await page.getByTestId('form-item-email').locator('input').fill(initialEmail);
	await selectOptionByTestId(page, 'role', 'user');
	await selectMultiOptionsByTestId(page, 'editOrganizations', [initialEditOrganizationName]);
	await selectMultiOptionsByTestId(page, 'readonlyOrganizations', [initialReadonlyOrganizationName]);
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
	await selectMultiOptionsByTestId(page, 'editOrganizations', [updatedEditOrganizationName]);
	await selectMultiOptionsByTestId(page, 'readonlyOrganizations', [updatedReadonlyOrganizationName]);
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

	const updatedUser = await prisma.user.findFirst({
		where: { contact: { email: updatedEmail } },
		select: {
			organizationAccesses: {
				select: {
					permission: true,
					organization: {
						select: {
							name: true,
						},
					},
				},
			},
		},
	});
	expect(updatedUser?.organizationAccesses).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				permission: 'edit',
				organization: expect.objectContaining({ name: updatedEditOrganizationName }),
			}),
			expect.objectContaining({
				permission: 'readonly',
				organization: expect.objectContaining({ name: updatedReadonlyOrganizationName }),
			}),
		]),
	);
});

test('delete user removes database and Firebase entries', async ({ page }) => {
	const firebaseService = await getFirebaseAdminService();
	const unique = Date.now();
	const firstName = 'Delete';
	const lastName = 'Me';
	const email = `e2e.user.delete.${unique}@example.com`;

	const openUserByEmail = async (searchEmail: string) => {
		await page.goto(`/portal/admin/users?page=1&pageSize=10&search=${encodeURIComponent(searchEmail)}`);
		await page.getByRole('cell', { name: searchEmail }).click();
	};

	await page.goto('/portal/admin/users');
	await clickDataTableActionItem(page, 'data-table-action-item-add-user');
	await page.getByTestId('form-item-firstName').locator('input').fill(firstName);
	await page.getByTestId('form-item-lastName').locator('input').fill(lastName);
	await page.getByTestId('form-item-email').locator('input').fill(email);
	await selectOptionByTestId(page, 'role', 'user');
	await selectMultiOptionsByTestId(page, 'editOrganizations', ['Migros']);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const createdUser = await prisma.user.findFirst({
		where: { contact: { email } },
		select: {
			id: true,
			account: {
				select: {
					firebaseAuthUserId: true,
				},
			},
		},
	});
	expect(createdUser).toBeDefined();

	await openUserByEmail(email);
	await page.getByRole('button', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Delete permanently' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const deletedUser = await prisma.user.findFirst({
		where: { contact: { email } },
		select: { id: true },
	});
	expect(deletedUser).toBeNull();

	const firebaseUserResult = await firebaseService.getByEmail(email);
	expect(firebaseUserResult.success).toBeTruthy();
	if (!firebaseUserResult.success) {
		throw new Error(firebaseUserResult.error);
	}
	expect(firebaseUserResult.data).toBeNull();
});
