import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { clickDataTableActionItem, expectToHaveScreenshot } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('admin focuses page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/focuses?sortBy=name&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test('admin focuses with direct URL search matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/focuses?page=1&pageSize=10&sortBy=name&sortDirection=asc&search=poverty');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test('admin focuses with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/focuses?page=1&pageSize=10&sortBy=name&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expectToHaveScreenshot(page);
});

test('add new focus', async ({ page }) => {
	const unique = Date.now();
	const name = `e2e-focus-${unique}`;

	await page.goto('/portal/admin/focuses');
	await clickDataTableActionItem(page, 'data-table-action-item-add-focus');
	await page.getByTestId('form-item-name').locator('input').fill(name);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const created = await prisma.focus.findUnique({
		where: { name },
		select: { id: true, name: true },
	});
	expect(created).toBeDefined();
	expect(created?.name).toBe(name);
});

test('shows uniqueness error when focus name already exists', async ({ page }) => {
	const existing = await prisma.focus.findFirst({
		orderBy: { name: 'asc' },
		select: { name: true },
	});
	expect(existing).toBeTruthy();
	if (!existing) {
		throw new Error('No existing focus found for uniqueness test');
	}

	await page.goto('/portal/admin/focuses');
	await clickDataTableActionItem(page, 'data-table-action-item-add-focus');
	await page.getByTestId('form-item-name').locator('input').fill(existing.name);
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByText('A focus with this name already exists.')).toBeVisible();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();
});

test('update focus', async ({ page }) => {
	const unique = Date.now();
	const initialName = `e2e-focus-initial-${unique}`;
	const updatedName = `e2e-focus-updated-${unique}`;

	const created = await prisma.focus.create({
		data: {
			name: initialName,
		},
		select: { id: true },
	});
	expect(created.id).toBeTruthy();

	await page.goto(`/portal/admin/focuses?page=1&pageSize=10&search=${encodeURIComponent(initialName)}`);
	const row = page
		.getByTestId('data-table')
		.getByRole('row')
		.filter({ has: page.getByRole('cell', { name: initialName }) })
		.first();
	await expect(row).toBeVisible();
	await row.click();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();

	await page.getByTestId('form-item-name').locator('input').fill(updatedName);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const updated = await prisma.focus.findUnique({
		where: { id: created.id },
		select: { name: true },
	});
	expect(updated).toBeDefined();
	expect(updated?.name).toBe(updatedName);
});

test('cannot delete focus while in use', async ({ page }) => {
	await page.goto('/portal/admin/focuses?page=1&pageSize=10&search=poverty');
	await page.getByRole('cell', { name: 'poverty' }).first().click();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();
	await page.getByRole('button', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Delete permanently' }).click();

	await expect(page.getByText('Cannot delete focus because it is still in use')).toBeVisible();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();
});
