import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { COUNTRY_OPTIONS } from '@/lib/types/country';
import { bestGuessCurrency } from '@/lib/types/currency';
import { expect, test } from '@playwright/test';
import { clickDataTableActionItem, selectOptionByTestId } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

const pickUnusedCountryOption = async (excludedCodes: string[] = []) => {
	const usedCountries = await prisma.country.findMany({
		select: { isoCode: true },
	});
	const usedCodes = new Set(usedCountries.map((country) => `${country.isoCode}`));
	for (const code of excludedCodes) {
		usedCodes.add(code);
	}

	const option = COUNTRY_OPTIONS.find((countryOption) => !usedCodes.has(countryOption.code));
	if (!option) {
		throw new Error('No unused country option found for e2e test.');
	}

	return option;
};

test('admin countries page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/countries');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin countries with direct URL search matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/countries?page=1&pageSize=10&search=country-liberia');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('admin countries with direct URL sorting matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/countries?page=1&pageSize=10&sortBy=isoCode&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('add new country', async ({ page }) => {
	const countryOption = await pickUnusedCountryOption();
	const defaultPayoutAmount = 123;
	const currency = bestGuessCurrency(countryOption.code);

	await page.goto('/portal/admin/countries');
	await clickDataTableActionItem(page, 'data-table-action-item-add-country');
	await selectOptionByTestId(page, 'countrySettings.isoCode', countryOption.name);
	await selectOptionByTestId(page, 'countrySettings.currency', currency);
	await page.getByTestId('form-item-countrySettings.defaultPayoutAmount').locator('input').fill(`${defaultPayoutAmount}`);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const created = await prisma.country.findUnique({
		where: { isoCode: countryOption.code },
		select: {
			id: true,
			isoCode: true,
			currency: true,
			defaultPayoutAmount: true,
		},
	});

	expect(created).toBeDefined();
	expect(created?.isoCode).toBe(countryOption.code);
	expect(created?.currency).toBe(currency);
	expect(Number(created?.defaultPayoutAmount)).toBe(defaultPayoutAmount);
});

test('shows validation error when default payout amount is invalid', async ({ page }) => {
	const countryOption = await pickUnusedCountryOption();
	const currency = bestGuessCurrency(countryOption.code);

	await page.goto('/portal/admin/countries');
	await clickDataTableActionItem(page, 'data-table-action-item-add-country');
	await selectOptionByTestId(page, 'countrySettings.isoCode', countryOption.name);
	await selectOptionByTestId(page, 'countrySettings.currency', currency);
	await page.getByTestId('form-item-countrySettings.defaultPayoutAmount').locator('input').fill('-1');
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByText('Default payout amount must be greater than 0.')).toBeVisible();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();
});

test('update country', async ({ page }) => {
	const countryOption = await pickUnusedCountryOption();
	const currency = bestGuessCurrency(countryOption.code);
	const initialPayoutAmount = 80;
	const updatedPayoutAmount = 95;

	const created = await prisma.country.create({
		data: {
			isoCode: countryOption.code,
			isActive: true,
			currency,
			defaultPayoutAmount: initialPayoutAmount,
		},
		select: { id: true },
	});
	expect(created.id).toBeTruthy();

	await page.goto(`/portal/admin/countries?page=1&pageSize=10&search=${countryOption.code}`);
	await expect(page.getByRole('cell', { name: countryOption.code }).first()).toBeVisible();
	await page.getByTestId('data-table').locator('tbody tr').first().click();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();

	await page.getByTestId('form-item-countrySettings.defaultPayoutAmount').locator('input').fill(`${updatedPayoutAmount}`);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const updated = await prisma.country.findUnique({
		where: { id: created.id },
		select: {
			defaultPayoutAmount: true,
		},
	});

	expect(updated).toBeDefined();
	expect(Number(updated?.defaultPayoutAmount)).toBe(updatedPayoutAmount);
});

test('update country clears existing source URLs', async ({ page }) => {
	const countryOption = await pickUnusedCountryOption();
	const currency = bestGuessCurrency(countryOption.code);
	const initialPayoutAmount = 80;

	const created = await prisma.country.create({
		data: {
			isoCode: countryOption.code,
			isActive: true,
			currency,
			defaultPayoutAmount: initialPayoutAmount,
			microfinanceSourceLink: {
				create: {
					text: 'WFP',
					href: 'https://www.wfp.org',
				},
			},
			networkSourceLink: {
				create: {
					text: 'ITU',
					href: 'https://www.itu.int',
				},
			},
		},
		select: { id: true },
	});
	expect(created.id).toBeTruthy();

	await page.goto(`/portal/admin/countries?page=1&pageSize=10&search=${countryOption.code}`);
	await expect(page.getByRole('cell', { name: countryOption.code }).first()).toBeVisible();
	await page.getByTestId('data-table').locator('tbody tr').first().click();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();

	const microfinanceSourceHrefInput = page
		.getByTestId('form-item-suitabilityOfCash.microfinanceSourceHref')
		.locator('input');
	const networkSourceHrefInput = page.getByTestId('form-item-mobileNetwork.networkSourceHref').locator('input');

	await expect(microfinanceSourceHrefInput).toHaveValue('https://www.wfp.org');
	await expect(networkSourceHrefInput).toHaveValue('https://www.itu.int');

	await microfinanceSourceHrefInput.clear();
	await networkSourceHrefInput.clear();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const updated = await prisma.country.findUnique({
		where: { id: created.id },
		select: {
			microfinanceSourceLink: {
				select: { id: true },
			},
			networkSourceLink: {
				select: { id: true },
			},
		},
	});

	expect(updated).toBeDefined();
	expect(updated?.microfinanceSourceLink).toBeNull();
	expect(updated?.networkSourceLink).toBeNull();

	await page.getByTestId('data-table').locator('tbody tr').first().click();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();
	await expect(microfinanceSourceHrefInput).toHaveValue('');
	await expect(networkSourceHrefInput).toHaveValue('');
});
