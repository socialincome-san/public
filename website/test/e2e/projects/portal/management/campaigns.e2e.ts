import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, Page, test } from '@playwright/test';
import { clickDataTableActionItem, selectOptionByTestId } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

const selectAnyValidEndDate = async (page: Page) => {
	await page.getByTestId('form-item-endDate').locator('button').click();
	await page.locator('[role="grid"] button:not([disabled])').first().click();
};

const saveCampaignAndWait = async (page: Page) => {
	await page.getByRole('button', { name: 'Save' }).click();
	await Promise.race([
		page.getByTestId('dynamic-form').waitFor({ state: 'detached' }),
		page.getByText('Error saving campaign:').waitFor({ state: 'visible' }),
	]);
	if (await page.getByTestId('dynamic-form').isVisible()) {
		const errorText = await page.getByText('Error saving campaign:').first().textContent();
		throw new Error(`Campaign save failed: ${errorText ?? 'Unknown error'}`);
	}
};

test.only('add new campaign', async ({ page }) => {
	const unique = Date.now();
	const title = `E2E Campaign ${unique}`;
	const program = await prisma.program.findFirst({
		select: { name: true },
	});
	expect(program?.name).toBeTruthy();

	await page.goto('/portal/management/campaigns');
	await clickDataTableActionItem(page, 'data-table-action-item-add-new-campaign');
	await page.getByTestId('form-item-title').locator('input').fill(title);
	await page.getByTestId('form-item-description').locator('input').fill('Campaign description');
	await page.getByTestId('form-item-goal').locator('input').fill('1000');
	await selectOptionByTestId(page, 'currency', 'CHF');
	await page.getByTestId('form-item-additionalAmountChf').locator('input').fill('100');
	await selectAnyValidEndDate(page);
	await selectOptionByTestId(page, 'program', program!.name);
	await saveCampaignAndWait(page);

	const created = await prisma.campaign.findUnique({
		where: { title },
		select: { id: true, title: true, currency: true },
	});
	expect(created).toBeDefined();
	expect(created?.currency).toBe('CHF');
});

test.only('edit campaign', async ({ page }) => {
	const existing = await prisma.campaign.findFirst({
		select: { id: true, title: true, description: true },
	});
	expect(existing).toBeTruthy();
	const updatedDescription = `Updated description ${Date.now()}`;

	await page.goto(`/portal/management/campaigns?page=1&pageSize=10&search=${encodeURIComponent(existing!.title)}`);
	await page.getByRole('cell', { name: existing!.title }).click();
	await page.getByTestId('form-item-description').locator('input').fill(updatedDescription);
	await selectOptionByTestId(page, 'program');
	await saveCampaignAndWait(page);

	const updated = await prisma.campaign.findUniqueOrThrow({
		where: { id: existing!.id },
		select: { description: true },
	});
	expect(updated.description).toBe(updatedDescription);
});

test.only('shows uniqueness error when campaign title already exists', async ({ page }) => {
	const existing = await prisma.campaign.findFirst({
		select: { title: true },
	});
	const program = await prisma.program.findFirst({
		select: { name: true },
	});
	expect(existing?.title).toBeTruthy();
	expect(program?.name).toBeTruthy();

	await page.goto('/portal/management/campaigns');
	await clickDataTableActionItem(page, 'data-table-action-item-add-new-campaign');
	await page.getByTestId('form-item-title').locator('input').fill(existing!.title);
	await page.getByTestId('form-item-description').locator('input').fill('Duplicate title test');
	await page.getByTestId('form-item-goal').locator('input').fill('1000');
	await selectOptionByTestId(page, 'currency', 'CHF');
	await page.getByTestId('form-item-additionalAmountChf').locator('input').fill('50');
	await selectAnyValidEndDate(page);
	await selectOptionByTestId(page, 'program', program!.name);
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByText('Error saving campaign: A campaign with this title already exists.')).toBeVisible();
});

test.only('shows uniqueness error when editing campaign title to an existing one', async ({ page }) => {
	const campaigns = await prisma.campaign.findMany({
		select: { title: true },
		orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
		take: 2,
	});
	expect(campaigns.length).toBeGreaterThanOrEqual(2);

	const sourceTitle = campaigns[0].title;
	const targetTitle = campaigns[1].title;

	await page.goto(`/portal/management/campaigns?page=1&pageSize=10&search=${encodeURIComponent(sourceTitle)}`);
	await page.getByRole('cell', { name: sourceTitle }).click();
	await page.getByTestId('form-item-title').locator('input').fill(targetTitle);
	await selectOptionByTestId(page, 'program');
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByText('Error saving campaign: A campaign with this title already exists.')).toBeVisible();
});
