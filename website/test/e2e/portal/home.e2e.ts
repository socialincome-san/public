import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
  await seedDatabase();
});

test('portal home-page matches screenshot', async ({ page }) => {
  await page.goto('/portal');
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test('create new program', async ({ page }) => {
  await page.goto('/portal');

  await page.getByTestId('create-program-modal-trigger').click();

  // Step 1
  await page.getByTestId('radio-card-country-sierra-leone').click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2
  await page.getByTestId('radio-card-targeted').click();
  await page.getByTestId('pill-multi-select-poverty').click();
  await page.getByTestId('pill-multi-select-health').click();
  await page.getByTestId('pill-multi-select-female').click();
  await expect(page.getByText('2 of 7 recipients match the selected country and filters')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 3
  await page.getByTestId('recipients-slider').getByRole('slider').click();
  await page.getByTestId('recipients-slider').getByRole('slider').press('ArrowLeft');
  await page.getByTestId('customize-payouts-switch').click();
  await page.getByTestId('program-duration-slider').getByRole('slider').click();
  await page.getByTestId('program-duration-slider').getByRole('slider').press('ArrowRight');
  await page.getByTestId('payout-per-interval-slider').getByRole('slider').click();
  await page.getByTestId('payout-per-interval-slider').getByRole('slider').press('ArrowRight');
  await page.getByTestId('payout-per-interval-slider').getByRole('slider').press('ArrowRight');
  await expect(page.getByTestId('total-budget-1258')).toBeVisible();
  await expect(page.getByTestId('monthly-cost-34')).toBeVisible();

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByText('Great! You initiated a new program')).toBeVisible();
});
