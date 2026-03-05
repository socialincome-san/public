import { Prisma } from '@/generated/prisma/client';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { getPrismaClient } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('admin countries page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/countries');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('Add new country', async ({ page }) => {
	const expectedCountry = {
		isoCode: 'CH' as const,
		currency: 'CHF' as const,
		defaultPayoutAmount: 100,
		microfinanceIndex: new Prisma.Decimal(1.11),
		populationCoverage: new Prisma.Decimal(82.3),
		networkTechnology: 'g5' as const,
		sanctions: ['us'] as const,
		mobileMoneyProviderName: 'Orange Money',
	};

	await page.goto('/portal/admin/countries');
	await page.getByTestId('data-table-actions-button').click();
	await page.getByTestId('data-table-action-item-add-country').click();

	await page.getByTestId('form-accordion-trigger-countrySettings').click();

	await page.getByTestId('form-item-countrySettings.isoCode').click();
	await page.getByPlaceholder('Search').fill('switzer');
	await page.getByRole('option', { name: 'Switzerland' }).click();
	await page.getByTestId('form-item-countrySettings.currency').click();
	await page.getByRole('option', { name: expectedCountry.currency }).click();
	await page
		.getByTestId('form-item-countrySettings.defaultPayoutAmount')
		.locator('input')
		.fill(String(expectedCountry.defaultPayoutAmount));

	await page.getByTestId('form-accordion-trigger-suitabilityOfCash').click();
	await page
		.getByTestId('form-item-suitabilityOfCash.microfinanceIndex')
		.locator('input')
		.fill(String(expectedCountry.microfinanceIndex));

	await page.getByTestId('form-item-suitabilityOfCash.microfinanceSourceText').locator('input').fill('source text');

	await page
		.getByTestId('form-item-suitabilityOfCash.microfinanceSourceHref')
		.locator('input')
		.fill('https://source-url.ch');

	await page.getByTestId('form-item-suitabilityOfCash.latestSurveyDate').locator('button').click();
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByLabel('Choose the Year').selectOption('2025');
	await page.getByRole('button', { name: 'Wednesday, March 12th,' }).click();

	await page.getByTestId('form-accordion-trigger-mobileNetwork').click();

	await page
		.getByTestId('form-item-mobileNetwork.populationCoverage')
		.locator('input')
		.fill(String(expectedCountry.populationCoverage));

	await page.getByTestId('form-item-mobileNetwork.networkTechnology').click();
	await page.getByRole('option', { name: '5G' }).click();

	await page.getByTestId('form-accordion-trigger-mobileMoney').click();
	await page.getByTestId('form-item-mobileMoney.mobileMoneyProviders').click();
	await page.getByPlaceholder('Search').fill('Orange Mon');
	await page.getByRole('option', { name: expectedCountry.mobileMoneyProviderName }).click();
	await page.keyboard.press('Escape');

	await page.getByTestId('form-accordion-trigger-noSanctions').click();
	await page.getByTestId('form-item-noSanctions.sanctions').click();
	await page.getByPlaceholder('Search').fill(expectedCountry.sanctions[0]);
	await page.getByRole('option', { name: expectedCountry.sanctions[0] }).click();
	await page.keyboard.press('Escape');

	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const prisma = await getPrismaClient();
	const totalCountries = await prisma.country.count();
	expect(totalCountries).toBe(10);

	const country = await prisma.country.findFirst({
		where: { isoCode: expectedCountry.isoCode },
		select: {
			isoCode: true,
			microfinanceIndex: true,
			populationCoverage: true,
			networkTechnology: true,
			mobileMoneyProviders: { select: { name: true } },
			sanctions: true,
		},
	});

	expect(country).toBeDefined();

	expect(country?.isoCode).toBe(expectedCountry.isoCode);
	expect(Number(country?.microfinanceIndex ?? 0)).toBe(Number(expectedCountry.microfinanceIndex));
	expect(Number(country?.populationCoverage ?? 0)).toBe(Number(expectedCountry.populationCoverage));
	expect(country?.networkTechnology).toBe(expectedCountry.networkTechnology);
	expect(country?.mobileMoneyProviders?.some((p) => p.name === expectedCountry.mobileMoneyProviderName)).toBe(true);
	expect(country?.sanctions).toContain(expectedCountry.sanctions[0]);
});
