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
	await page.goto('/portal/admin/organizations?page=1&pageSize=10&sortBy=name&sortDirection=asc&search=organization-3');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test('admin organizations with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/organizations?page=1&pageSize=10&sortBy=name&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test('add new organization with users and program permissions', async ({ page }) => {
	const organizationName = `E2E Organization ${Date.now()}`;

	await page.goto('/portal/admin/organizations');
	await clickDataTableActionItem(page, 'data-table-action-item-add-organization');
	await page.getByTestId('form-item-name').locator('input').fill(organizationName);
	await selectMultiOptionsByTestId(page, 'users', ['Portal Tester', 'Jonas Baumann']);
	await selectMultiOptionsByTestId(page, 'ownedPrograms', ['Migros Relief SL']);
	await selectMultiOptionsByTestId(page, 'operatedPrograms', ['Coop Cash Aid SL']);
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

	expect(organizationAccesses).toEqual(
		expect.arrayContaining([
			expect.objectContaining({ userId: 'user-1' }),
			expect.objectContaining({ userId: 'user-2' }),
		]),
	);
	expect(programAccesses).toEqual(
		expect.arrayContaining([
			expect.objectContaining({ permission: 'owner', programId: 'program-1' }),
			expect.objectContaining({ permission: 'operator', programId: 'program-3' }),
		]),
	);
});

test('update organization users and permissions', async ({ page }) => {
	const organization = await prisma.organization.create({
		data: { name: `E2E Update Organization ${Date.now()}` },
		select: { id: true, name: true },
	});

	await page.goto(`/portal/admin/organizations?page=1&pageSize=10&search=${encodeURIComponent(organization.name)}`);
	await page.getByRole('cell', { name: organization.name }).click();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();

	await page.getByTestId('form-item-name').locator('input').fill(`${organization.name} Updated`);
	await selectMultiOptionsByTestId(page, 'users', ['Portal Tester', 'Jonas Baumann']);
	await selectMultiOptionsByTestId(page, 'ownedPrograms', ['Migros Relief SL']);
	await selectMultiOptionsByTestId(page, 'operatedPrograms', ['Coop Cash Aid SL']);
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

	expect(organizationAccesses).toEqual(
		expect.arrayContaining([
			expect.objectContaining({ userId: 'user-1' }),
			expect.objectContaining({ userId: 'user-2' }),
		]),
	);
	expect(programAccesses).toEqual(
		expect.arrayContaining([
			expect.objectContaining({ permission: 'owner', programId: 'program-1' }),
			expect.objectContaining({ permission: 'operator', programId: 'program-3' }),
		]),
	);
});

test('delete organization', async ({ page }) => {
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
