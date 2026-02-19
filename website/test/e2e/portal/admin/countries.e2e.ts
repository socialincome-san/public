import { Country, Prisma } from '@/generated/prisma/client';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { getCountryService } from '../../utils';

test.beforeEach(async () => {
  await seedDatabase();
});

test('Add new country', async ({ page }) => {
  const expectedCountry: Country = {
    id: '',
    isoCode: 'CH',
    microfinanceIndex: new Prisma.Decimal(1.11),
    populationCoverage: new Prisma.Decimal(82.3),
    networkTechnology: 'g5',
    paymentProviders: ['orange_money'],
    sanctions: ['us'],
    isActive: false,
    latestSurveyDate: null,
    microfinanceSourceLinkId: null,
    networkSourceLinkId: null,
    createdAt: new Date('2024-03-12T12:00:00.000Z'),
    updatedAt: null,
  };

  await page.goto('/portal/admin/countries');
  await page.getByRole('button', { name: 'Add country' }).click();

  await page.getByTestId('form-item-isoCode').click();
  await page.getByPlaceholder('Search').fill('switzer');
  await page.getByRole('option', { name: 'Switzerland' }).click();

  await page.getByTestId('form-item-microfinanceIndex').locator('input').fill(String(expectedCountry.microfinanceIndex));

  await page.getByTestId('form-item-microfinanceSourceText').locator('input').fill('source text');

  await page.getByTestId('form-item-microfinanceSourceHref').locator('input').fill('https://source-url.ch');

  await page.getByTestId('form-item-populationCoverage').locator('input').fill(String(expectedCountry.populationCoverage));

  await page.getByTestId('form-item-latestSurveyDate').locator('button').click();
  await page.getByLabel('Choose the Month').selectOption('2');
  await page.getByLabel('Choose the Year').selectOption('2025');
  await page.getByRole('button', { name: 'Wednesday, March 12th,' }).click();

  await page.getByTestId('form-item-networkTechnology').click();
  await page.getByRole('option', { name: '5G' }).click();

  await page.getByTestId('form-item-paymentProviders').click();
  await page.getByPlaceholder('Search').fill('Orange Mon');
  await page.getByRole('option', { name: 'Orange Money' }).click();
  await page.keyboard.press('Escape');

  await page.getByTestId('form-item-sanctions').click();
  await page.getByPlaceholder('Search').fill(expectedCountry.sanctions[0]);
  await page.getByRole('option', { name: expectedCountry.sanctions[0] }).click();
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

  const countryService = await getCountryService();
  const result = await countryService.getTableView('user-2');

  if (!result.success) {
    throw new Error(result.error);
  }

  expect(result.data.tableRows.length).toBe(7);

  const country = result.data.tableRows.find((c) => c.isoCode === expectedCountry.isoCode);

  expect(country).toBeDefined();

  expect(country?.isoCode).toBe(expectedCountry.isoCode);
  expect(country?.microfinanceIndex).toBe(Number(expectedCountry.microfinanceIndex));
  expect(country?.populationCoverage).toBe(Number(expectedCountry.populationCoverage));
  expect(country?.networkTechnology).toBe(expectedCountry.networkTechnology);
  expect(country?.paymentProviders).toContain(expectedCountry.paymentProviders[0]);
  expect(country?.sanctions).toContain(expectedCountry.sanctions[0]);
});
