import { ExpenseType } from '@/generated/prisma/enums';
import { ROUTES } from '@/lib/constants/routes';
import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { clickDataTableActionItem, selectOptionByTestId } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('admin expenses page matches screenshot', async ({ page }) => {
	await page.goto(ROUTES.portalAdminExpenses);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin expenses with direct URL search matches screenshot', async ({ page }) => {
	await page.goto(`${ROUTES.portalAdminExpenses}?page=1&pageSize=10&search=expense-2`);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin expenses with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto(`${ROUTES.portalAdminExpenses}?page=1&pageSize=10&sortBy=amountChf&sortDirection=asc`);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('add new expense', async ({ page }) => {
	const unique = Date.now();
	const year = 2099;
	const amountChf = Number(`1${String(unique).slice(-5)}`);
	const organization = await prisma.organization.findFirst({
		orderBy: { name: 'asc' },
		select: { id: true, name: true },
	});
	expect(organization).toBeTruthy();
	if (!organization) {
		throw new Error('No organization found for expense test');
	}

	await page.goto(ROUTES.portalAdminExpenses);
	await clickDataTableActionItem(page, 'data-table-action-item-add-expense');
	await selectOptionByTestId(page, 'type', ExpenseType.staff);
	await page.getByTestId('form-item-year').locator('input').fill(`${year}`);
	await page.getByTestId('form-item-amountChf').locator('input').fill(`${amountChf}`);
	await selectOptionByTestId(page, 'organization', organization.name);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const created = await prisma.expense.findFirst({
		where: {
			type: ExpenseType.staff,
			year,
			amountChf,
			organizationId: organization.id,
		},
		select: { id: true, year: true, type: true, organizationId: true, amountChf: true },
	});

	expect(created).toBeDefined();
	expect(created?.type).toBe(ExpenseType.staff);
	expect(created?.year).toBe(year);
	expect(Number(created?.amountChf)).toBe(amountChf);
	expect(created?.organizationId).toBe(organization.id);
});

test('shows validation error when amount is negative', async ({ page }) => {
	const organization = await prisma.organization.findFirst({
		orderBy: { name: 'asc' },
		select: { name: true },
	});
	expect(organization).toBeTruthy();
	if (!organization) {
		throw new Error('No organization found for expense test');
	}

	await page.goto(ROUTES.portalAdminExpenses);
	await clickDataTableActionItem(page, 'data-table-action-item-add-expense');
	await selectOptionByTestId(page, 'type', ExpenseType.staff);
	await page.getByTestId('form-item-year').locator('input').fill('2099');
	await page.getByTestId('form-item-amountChf').locator('input').fill('-1');
	await selectOptionByTestId(page, 'organization', organization.name);
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByText('Amount CHF must be zero or greater.')).toBeVisible();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();
});

test('update expense', async ({ page }) => {
	const organizations = await prisma.organization.findMany({
		orderBy: { name: 'asc' },
		select: { id: true, name: true },
		take: 2,
	});
	expect(organizations.length).toBeGreaterThan(0);
	if (organizations.length === 0) {
		throw new Error('No organization found for expense test');
	}

	const initialOrganization = organizations[0];
	const updatedOrganization = organizations[1] ?? organizations[0];
	const unique = Date.now();
	const initialYear = 2098;
	const updatedYear = 2097;
	const initialAmount = Number(`2${String(unique).slice(-5)}`);
	const updatedAmount = Number(`3${String(unique).slice(-5)}`);

	const created = await prisma.expense.create({
		data: {
			type: ExpenseType.staff,
			year: initialYear,
			amountChf: initialAmount,
			organizationId: initialOrganization.id,
		},
		select: { id: true },
	});
	expect(created.id).toBeTruthy();

	const openExpenseByYear = async (searchYear: number) => {
		await page.goto(`${ROUTES.portalAdminExpenses}?page=1&pageSize=10&search=${searchYear}`);
		const row = page
			.getByTestId('data-table')
			.getByRole('row')
			.filter({ has: page.getByRole('cell', { name: `${searchYear}` }) })
			.first();
		await expect(row).toBeVisible();
		await row.click();
		if (await page.getByTestId('dynamic-form').isVisible()) {
			return;
		}
		await row.click({ force: true });
		await expect(page.getByTestId('dynamic-form')).toBeVisible();
	};

	await openExpenseByYear(initialYear);
	await selectOptionByTestId(page, 'type', ExpenseType.administrative);
	await page.getByTestId('form-item-year').locator('input').fill(`${updatedYear}`);
	await page.getByTestId('form-item-amountChf').locator('input').fill(`${updatedAmount}`);
	await selectOptionByTestId(page, 'organization', updatedOrganization.name);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const updated = await prisma.expense.findUnique({
		where: { id: created.id },
		select: {
			type: true,
			year: true,
			amountChf: true,
			organizationId: true,
		},
	});

	expect(updated).toBeDefined();
	expect(updated?.type).toBe(ExpenseType.administrative);
	expect(updated?.year).toBe(updatedYear);
	expect(Number(updated?.amountChf)).toBe(updatedAmount);
	expect(updated?.organizationId).toBe(updatedOrganization.id);
});
