import { ROUTES } from '@/lib/constants/routes';
import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { clickDataTableActionItem } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('admin mobile money providers page matches screenshot', async ({ page }) => {
	await page.goto(ROUTES.portalAdminMobileMoneyProviders);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin mobile money providers with direct URL search matches screenshot', async ({ page }) => {
	await page.goto(`${ROUTES.portalAdminMobileMoneyProviders}?page=1&pageSize=10&search=mobile-money-provider-id-1`);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin mobile money providers with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto(`${ROUTES.portalAdminMobileMoneyProviders}?page=1&pageSize=10&sortBy=name&sortDirection=asc`);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('add new mobile money provider', async ({ page }) => {
	const unique = Date.now();
	const name = `e2e-mobile-money-provider-${unique}`;

	await page.goto(ROUTES.portalAdminMobileMoneyProviders);
	await clickDataTableActionItem(page, 'data-table-action-item-add-provider');
	await page.getByTestId('form-item-name').locator('input').fill(name);
	await page.getByTestId('form-item-isSupported').locator('button').click();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const created = await prisma.mobileMoneyProvider.findUnique({
		where: { name },
		select: { id: true, name: true, isSupported: true },
	});
	expect(created).toBeDefined();
	expect(created?.name).toBe(name);
	expect(created?.isSupported).toBe(true);
});

test('shows uniqueness error when provider name already exists', async ({ page }) => {
	const existing = await prisma.mobileMoneyProvider.findFirst({
		orderBy: { name: 'asc' },
		select: { name: true },
	});
	expect(existing).toBeTruthy();
	if (!existing) {
		throw new Error('No existing mobile money provider found for uniqueness test');
	}

	await page.goto(ROUTES.portalAdminMobileMoneyProviders);
	await clickDataTableActionItem(page, 'data-table-action-item-add-provider');
	await page.getByTestId('form-item-name').locator('input').fill(existing.name);
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByText('A mobile money provider with this name already exists.')).toBeVisible();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();
});

test('update mobile money provider', async ({ page }) => {
	const unique = Date.now();
	const initialName = `e2e-mobile-money-provider-initial-${unique}`;
	const updatedName = `e2e-mobile-money-provider-updated-${unique}`;

	const created = await prisma.mobileMoneyProvider.create({
		data: {
			name: initialName,
			isSupported: false,
		},
		select: { id: true },
	});
	expect(created.id).toBeTruthy();

	await page.goto(
		`${ROUTES.portalAdminMobileMoneyProviders}?page=1&pageSize=10&search=${encodeURIComponent(initialName)}`,
	);
	const row = page
		.getByTestId('data-table')
		.getByRole('row')
		.filter({ has: page.getByRole('cell', { name: initialName }) })
		.first();
	await expect(row).toBeVisible();
	await row.click();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();

	await page.getByTestId('form-item-name').locator('input').fill(updatedName);
	await page.getByTestId('form-item-isSupported').locator('button').click();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const updated = await prisma.mobileMoneyProvider.findUnique({
		where: { id: created.id },
		select: { name: true, isSupported: true },
	});
	expect(updated).toBeDefined();
	expect(updated?.name).toBe(updatedName);
	expect(updated?.isSupported).toBe(true);
});
