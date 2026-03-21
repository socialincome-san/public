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

test('add new campaign', async ({ page }) => {
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

test('edit campaign', async ({ page }) => {
	const existing = await prisma.campaign.findUnique({
		where: { id: 'campaign-si-core-sl-default' },
		select: { id: true, title: true },
	});
	expect(existing).toBeTruthy();
	const updatedDescription = `Updated description ${Date.now()}`;

	await page.goto(`/portal/management/campaigns?page=1&pageSize=10&search=${encodeURIComponent(existing!.title)}`);
	const editableRow = page.getByRole('row').filter({ hasText: existing!.title }).first();
	await expect(editableRow.getByTestId('action-cell-icon-edit')).toBeVisible();
	await editableRow.getByRole('cell', { name: existing!.title }).click();
	await expect(page.getByRole('heading', { name: 'Edit Campaign' })).toBeVisible();
	await page.getByTestId('form-item-description').locator('input').fill(updatedDescription);
	await selectOptionByTestId(page, 'program');
	await saveCampaignAndWait(page);

	const updated = await prisma.campaign.findUniqueOrThrow({
		where: { id: existing!.id },
		select: { description: true },
	});
	expect(updated.description).toBe(updatedDescription);
});

test('shows view icon and readonly dialog for owner-only campaign rows', async ({ page }) => {
	const ownerOnly = await prisma.campaign.findUnique({
		where: { id: 'campaign-si-health-lr-default' },
		select: { title: true },
	});
	expect(ownerOnly).toBeTruthy();

	await page.goto(`/portal/management/campaigns?page=1&pageSize=10&search=${encodeURIComponent(ownerOnly!.title)}`);
	const row = page.getByRole('row').filter({ hasText: ownerOnly!.title }).first();
	await expect(row.getByTestId('action-cell-icon-view')).toBeVisible();
	await row.getByRole('cell', { name: ownerOnly!.title }).click();
	await expect(page.getByRole('heading', { name: 'View Campaign' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Save' })).toBeHidden();
});

test('shows uniqueness error when campaign title already exists', async ({ page }) => {
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

test('shows uniqueness error when editing campaign title to an existing one', async ({ page }) => {
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
