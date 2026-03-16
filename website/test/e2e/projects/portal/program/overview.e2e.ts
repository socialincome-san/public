import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, Page, test } from '@playwright/test';
import { selectOptionByTestId } from '../../../utils';

const openProgramSettingsDialog = async (page: Page) => {
	await page.goto('/portal/programs/program-1/overview');
	await page.getByRole('button', { name: 'Program settings' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();

	return dialog;
};

const selectMultiOptionsByTestId = async (page: Page, fieldName: string, optionLabels: string[]) => {
	const field = page.getByTestId(`form-item-${fieldName}`);
	await field.waitFor({ state: 'visible' });
	await field.locator('button[role="combobox"]').click();

	for (const optionLabel of optionLabels) {
		await page.getByRole('option', { name: optionLabel }).click();
	}

	await page.keyboard.press('Escape');
};

test.beforeEach(async () => {
	await seedDatabase();
});

test('Program ready for payout overview page matches screenshot', async ({ page }) => {
	await page.goto('/portal/programs/program-1/overview');
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('Program not ready for payout overview page matches screenshot', async ({ page }) => {
	await page.goto('/portal/programs/program-2/overview');
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('program settings dialog for program-1 updates all editable values and saves', async ({ page }) => {
	const updatedName = 'Program One Updated E2E';
	const updatedDuration = '24';
	const updatedPayoutPerInterval = '77';

	let dialog = await openProgramSettingsDialog(page);
	await dialog.getByTestId('form-item-name').locator('input').fill(updatedName);
	await selectOptionByTestId(page, 'country', 'Angola (AOA)');
	await dialog.getByTestId('form-item-programDurationInMonths').locator('input').fill(updatedDuration);
	await dialog.getByTestId('form-item-payoutPerInterval').locator('input').fill(updatedPayoutPerInterval);
	await selectOptionByTestId(page, 'payoutInterval', 'Quarterly');
	await selectMultiOptionsByTestId(page, 'targetCauses', ['poverty']);
	await selectMultiOptionsByTestId(page, 'targetProfiles', ['female']);
	await dialog.getByRole('button', { name: 'Save' }).click();
	await expect(dialog).not.toBeVisible();

	dialog = await openProgramSettingsDialog(page);
	await expect(dialog.getByTestId('form-item-name').locator('input')).toHaveValue(updatedName);
	await expect(dialog.getByTestId('form-item-country')).toContainText('Angola');
	await expect(dialog.getByTestId('form-item-programDurationInMonths').locator('input')).toHaveValue(updatedDuration);
	await expect(dialog.getByTestId('form-item-payoutPerInterval').locator('input')).toHaveValue(updatedPayoutPerInterval);
	await expect(dialog.getByTestId('form-item-payoutInterval')).toContainText('Quarterly');
	await expect(dialog.getByTestId('form-item-targetCauses')).toContainText('poverty');
	await expect(dialog.getByTestId('form-item-targetProfiles')).toContainText('female');

	await expect(page).toHaveScreenshot({ fullPage: true });
});
