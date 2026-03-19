import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { clickDataTableActionItem, expectToHaveScreenshot, selectMultiOptionsByTestId } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('admin organizations page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/organizations?sortBy=name&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test('admin organizations with direct URL search matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/organizations?page=1&pageSize=10&sortBy=name&sortDirection=asc&search=Social%20Income');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test('admin organizations with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/organizations?page=1&pageSize=10&sortBy=name&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test.only('add new organization with users and program permissions', async ({ page }) => {
	const organizationName = `E2E Organization ${Date.now()}`;
	const selectedUsers = ['si_power_user global_owner', 'si_sl_user_1 owner'];
	const ownedProgramName = 'SI Core Program SL';
	const operatedProgramName = 'SI Women Support SL';

	await page.goto('/portal/admin/organizations');
	await clickDataTableActionItem(page, 'data-table-action-item-add-organization');
	await page.getByTestId('form-item-name').locator('input').fill(organizationName);
	await selectMultiOptionsByTestId(page, 'users', selectedUsers);
	await selectMultiOptionsByTestId(page, 'ownedPrograms', [ownedProgramName]);
	await selectMultiOptionsByTestId(page, 'operatedPrograms', [operatedProgramName]);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const created = await prisma.organization.findUnique({
		where: { name: organizationName },
		select: { id: true },
	});
	expect(created).toBeDefined();
	if (!created) {
		throw new Error('Organization was not created.');
	}

	const selectedUserIds = await prisma.user.findMany({
		where: { contact: { email: { in: ['power@portal.test', 'sl1@portal.test'] } } },
		select: { id: true },
	});

	const [organizationAccesses, programAccesses] = await Promise.all([
		prisma.organizationAccess.findMany({
			where: { organizationId: created.id },
			select: { userId: true },
		}),
		prisma.programAccess.findMany({
			where: { organizationId: created.id },
			select: { permission: true, programId: true },
		}),
	]);

	const selectedUserIdSet = new Set(selectedUserIds.map((user) => user.id));
	for (const access of organizationAccesses) {
		expect(selectedUserIdSet.has(access.userId)).toBeTruthy();
	}

	expect(organizationAccesses).toEqual(
		expect.arrayContaining(selectedUserIds.map((user) => expect.objectContaining({ userId: user.id }))),
	);
	expect(programAccesses).toEqual(
		expect.arrayContaining([
			expect.objectContaining({ permission: 'owner', programId: 'program-si-core-sl' }),
			expect.objectContaining({ permission: 'operator', programId: 'program-si-women-support-sl' }),
		]),
	);
});

test.only('update organization users and permissions', async ({ page }) => {
	const selectedUsers = ['si_power_user global_owner', 'si_sl_user_1 owner'];
	const ownedProgramName = 'SI Core Program SL';
	const operatedProgramName = 'SI Women Support SL';

	const organization = await prisma.organization.create({
		data: { name: `E2E Update Organization ${Date.now()}` },
		select: { id: true, name: true },
	});

	await page.goto(`/portal/admin/organizations?page=1&pageSize=10&search=${encodeURIComponent(organization.name)}`);
	await page.getByRole('cell', { name: organization.name }).click();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();

	await page.getByTestId('form-item-name').locator('input').fill(`${organization.name} Updated`);
	await selectMultiOptionsByTestId(page, 'users', selectedUsers);
	await selectMultiOptionsByTestId(page, 'ownedPrograms', [ownedProgramName]);
	await selectMultiOptionsByTestId(page, 'operatedPrograms', [operatedProgramName]);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const updated = await prisma.organization.findUnique({
		where: { id: organization.id },
		select: { name: true },
	});
	expect(updated?.name).toBe(`${organization.name} Updated`);

	const [organizationAccesses, programAccesses] = await Promise.all([
		prisma.organizationAccess.findMany({
			where: { organizationId: organization.id },
			select: { userId: true },
		}),
		prisma.programAccess.findMany({
			where: { organizationId: organization.id },
			select: { permission: true, programId: true },
		}),
	]);

	const selectedUserIds = await prisma.user.findMany({
		where: { contact: { email: { in: ['power@portal.test', 'sl1@portal.test'] } } },
		select: { id: true },
	});

	expect(organizationAccesses).toEqual(
		expect.arrayContaining(selectedUserIds.map((user) => expect.objectContaining({ userId: user.id }))),
	);
	expect(programAccesses).toEqual(
		expect.arrayContaining([
			expect.objectContaining({ permission: 'owner', programId: 'program-si-core-sl' }),
			expect.objectContaining({ permission: 'operator', programId: 'program-si-women-support-sl' }),
		]),
	);
});

test.only('delete organization', async ({ page }) => {
	const organization = await prisma.organization.create({
		data: { name: `E2E Delete Organization ${Date.now()}` },
		select: { id: true, name: true },
	});

	await page.goto(`/portal/admin/organizations?page=1&pageSize=10&search=${encodeURIComponent(organization.name)}`);
	await page.getByRole('cell', { name: organization.name }).click();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();

	await page.getByRole('button', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Delete permanently' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const deleted = await prisma.organization.findUnique({
		where: { id: organization.id },
		select: { id: true },
	});
	expect(deleted).toBeNull();
});
