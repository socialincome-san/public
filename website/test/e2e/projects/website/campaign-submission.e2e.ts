import { expect, test, type Page } from '@playwright/test';

const programStepTitle = 'Which program would you like to create a campaign for?';
const detailsStepTitle = 'Campaign Details';

const openCreateCampaignDialog = async (page: Page) => {
	await page.goto('/en/ch/campaigns');
	await page.getByRole('button', { name: 'Create campaign' }).click();
	await expect(page.getByRole('heading', { name: programStepTitle })).toBeVisible();
};

test.describe('campaign submission', () => {
	test('opens the create campaign form on the program step', async ({ page }) => {
		await openCreateCampaignDialog(page);

		await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
		await expect(page.getByLabel('Title')).toHaveCount(0);
		await expect(page.getByLabel('Primary image')).toHaveCount(0);
	});

	test('requires a program before continuing to details', async ({ page }) => {
		await openCreateCampaignDialog(page);

		await page.getByRole('button', { name: 'Continue' }).click();

		await expect(page.getByText('Program is required.')).toBeVisible();
		await expect(page.getByRole('heading', { name: programStepTitle })).toBeVisible();
		await expect(page.getByRole('heading', { name: detailsStepTitle })).toHaveCount(0);
	});
});
