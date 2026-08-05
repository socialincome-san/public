import { E2E_ELIGIBLE_CAMPAIGN_PROGRAMS_KEY } from '@/components/campaign/campaign-submission/e2e-eligible-programs';
import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';
import { expect, test, type Page } from '@playwright/test';

const programStepTitle = 'Which program would you like to create a campaign for?';
const detailsStepTitle = 'Campaign Details';

const e2eEligibleCampaignPrograms: PublicSubmissionProgramOption[] = [
	{
		id: 'program-si-core-sl',
		name: 'Sierra Leone Unconditional',
		slug: 'sierra-leone-core-program',
		countryId: 'country-sierra-leone',
		countryIsoCode: 'SL',
		recipientsCount: 12,
		description: 'E2E mock program description.',
		imageUrl: null,
		tags: ['Poverty'],
	},
	{
		id: 'program-si-livelihood-gh',
		name: 'Ghana Core Program',
		slug: 'ghana-core-program',
		countryId: 'country-ghana',
		countryIsoCode: 'GH',
		recipientsCount: 8,
		description: 'E2E mock program in Ghana.',
		imageUrl: null,
		tags: ['Health'],
	},
];

const mockEligibleCampaignPrograms = async (page: Page) => {
	await page.addInitScript(
		({ key, programs }) => {
			Object.defineProperty(window, key, {
				configurable: true,
				value: programs,
			});
		},
		{ key: E2E_ELIGIBLE_CAMPAIGN_PROGRAMS_KEY, programs: e2eEligibleCampaignPrograms },
	);
};

const openCreateCampaignDialog = async (page: Page) => {
	await mockEligibleCampaignPrograms(page);
	await page.goto('/en/ch/campaigns');
	await page.getByRole('button', { name: 'Create campaign' }).click();
	await expect(page.getByRole('heading', { name: programStepTitle })).toBeVisible();
};

const waitForProgramsReady = async (page: Page) => {
	await expect(page.getByRole('radio').first()).toBeVisible();
	await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled();
};

test.describe('campaign submission', () => {
	test('opens the create campaign form on the program step', async ({ page }) => {
		await openCreateCampaignDialog(page);
		await waitForProgramsReady(page);

		await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
		await expect(page.getByLabel('Title')).toHaveCount(0);
		await expect(page.getByLabel('Primary image')).toHaveCount(0);
	});

	test('requires a program before continuing to details', async ({ page }) => {
		await openCreateCampaignDialog(page);
		await waitForProgramsReady(page);

		await page.getByRole('button', { name: 'Continue' }).click();

		await expect(page.getByText('Program is required.')).toBeVisible();
		await expect(page.getByRole('heading', { name: programStepTitle })).toBeVisible();
		await expect(page.getByRole('heading', { name: detailsStepTitle })).toHaveCount(0);
	});
});
