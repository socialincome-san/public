import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, Page, test } from '@playwright/test';
import { selectMultiOptionsByTestId, selectOptionByTestId } from '../../../utils';

const openProgramSettingsDialog = async (page: Page, programId = 'program-1') => {
	await page.goto(`/portal/programs/${programId}/overview`);
	await page.getByRole('button', { name: 'Program settings' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();

	return dialog;
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
	const updatedOwnerOrganizations = ['Coop'];
	const updatedOperatorOrganizations = ['Swiss Red Cross'];

	let dialog = await openProgramSettingsDialog(page);
	await dialog.getByTestId('form-item-name').locator('input').fill(updatedName);
	await selectOptionByTestId(page, 'country', 'Angola (AOA)');
	await dialog.getByTestId('form-item-programDurationInMonths').locator('input').fill(updatedDuration);
	await dialog.getByTestId('form-item-payoutPerInterval').locator('input').fill(updatedPayoutPerInterval);
	await selectOptionByTestId(page, 'payoutInterval', 'Quarterly');
	await selectMultiOptionsByTestId(page, 'targetCauses', ['poverty']);
	await selectMultiOptionsByTestId(page, 'targetProfiles', ['female']);
	await selectMultiOptionsByTestId(page, 'ownerOrganizations', updatedOwnerOrganizations);
	await selectMultiOptionsByTestId(page, 'operatorOrganizations', updatedOperatorOrganizations);
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
	await expect(dialog.getByTestId('form-item-ownerOrganizations')).toContainText('Coop');
	await expect(dialog.getByTestId('form-item-operatorOrganizations')).toContainText('Swiss Red Cross');

	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('program settings dialog can delete a newly created program and redirects to portal', async ({ page }) => {
	await page.goto('/portal');
	await page.getByTestId('create-program-modal-trigger').click();

	await page.getByTestId('radio-card-country-sierra-leone').click();
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByTestId('radio-card-targeted').click();
	await page.getByTestId('pill-multi-select-poverty').click();
	await page.getByTestId('pill-multi-select-health').click();
	await page.getByTestId('pill-multi-select-female').click();
	await expect(page.getByText('2 of 7 recipients match the selected country and filters')).toBeVisible();
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('button', { name: 'Continue' }).click();

	await expect(page.getByText('Great! You initiated a new program')).toBeVisible();

	const createdProgramPath = new URL(page.url()).pathname;
	const createdProgramId = createdProgramPath.split('/')[3];
	expect(createdProgramId).toBeTruthy();

	const dialog = await openProgramSettingsDialog(page, createdProgramId);
	await dialog.getByRole('button', { name: 'Delete' }).click();
	await page.getByRole('button', { name: 'Delete permanently' }).click();

	await expect(page).toHaveURL('/portal');
});
