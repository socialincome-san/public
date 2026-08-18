import { getStoryblokCampaignTitleForSlug } from '@/components/storyblok/campaign/campaign.utils';
import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { defaultLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { expect, test } from '@playwright/test';
import { clickDataTableActionItem, selectOptionByTestId } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

const getCampaignTitle = async (slug: string) => {
	const result = await services.storyblok.getCampaigns(defaultLanguage);
	expect(result.success).toBe(true);

	return getStoryblokCampaignTitleForSlug(result.success ? result.data : [], slug);
};

test('add new contribution', async ({ page }) => {
	const source = await prisma.contribution.findFirst({
		select: {
			contributorId: true,
			campaignId: true,
			contributor: {
				select: {
					contact: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
				},
			},
			campaign: {
				select: {
					slug: true,
				},
			},
		},
	});
	expect(source).toBeTruthy();

	const contributorName =
		`${source!.contributor.contact?.firstName ?? ''} ${source!.contributor.contact?.lastName ?? ''}`.trim();
	const campaignTitle = await getCampaignTitle(source!.campaign.slug!);
	const amount = 99.5;
	const amountChf = 88.2;
	const feesChf = 1.3;

	await page.goto('/portal/management/contributions');
	await clickDataTableActionItem(page, 'data-table-action-item-add-contribution');
	await selectOptionByTestId(page, 'contributor', contributorName);
	await selectOptionByTestId(page, 'campaign', campaignTitle);
	await page.getByTestId('form-item-amount').locator('input').fill(`${amount}`);
	await selectOptionByTestId(page, 'currency', 'USD');
	await page.getByTestId('form-item-amountChf').locator('input').fill(`${amountChf}`);
	await page.getByTestId('form-item-feesChf').locator('input').fill(`${feesChf}`);
	await selectOptionByTestId(page, 'status', 'succeeded');
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const created = await prisma.contribution.findFirst({
		where: {
			contributorId: source!.contributorId,
			campaignId: source!.campaignId,
			amount: amount,
			amountChf: amountChf,
			feesChf: feesChf,
			currency: 'USD',
			status: 'succeeded',
		},
		select: { id: true },
	});
	expect(created).toBeDefined();
});

test('edit contribution', async ({ page }) => {
	const existing = await prisma.contribution.findUnique({
		where: { id: 'contribution-mixed-owner-2' },
		select: {
			id: true,
			contributor: {
				select: {
					contact: { select: { email: true } },
				},
			},
			campaign: {
				select: {
					slug: true,
				},
			},
		},
	});
	expect(existing).toBeTruthy();

	const updatedAmount = 123.45;
	const updatedAmountChf = 111.11;
	const updatedFeesChf = 2.22;
	const campaignTitle = await getCampaignTitle(existing!.campaign.slug!);

	await page.goto(
		`/portal/management/contributions?page=1&pageSize=10&search=${encodeURIComponent(existing!.contributor.contact.email!)}`,
	);
	const editableRow = page
		.getByRole('row')
		.filter({ hasText: existing!.contributor.contact.email! })
		.filter({ hasText: campaignTitle })
		.first();
	await expect(editableRow.getByTestId('action-cell-icon')).toBeVisible();
	await editableRow.click();
	await expect(page.getByRole('heading', { name: 'Edit Contribution' })).toBeVisible();
	await page.getByTestId('form-item-amount').locator('input').fill(`${updatedAmount}`);
	await page.getByTestId('form-item-amountChf').locator('input').fill(`${updatedAmountChf}`);
	await page.getByTestId('form-item-feesChf').locator('input').fill(`${updatedFeesChf}`);
	await selectOptionByTestId(page, 'status', 'pending');
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const updated = await prisma.contribution.findUniqueOrThrow({
		where: { id: existing!.id },
		select: {
			amount: true,
			amountChf: true,
			feesChf: true,
			status: true,
		},
	});
	expect(Number(updated.amount)).toBe(updatedAmount);
	expect(Number(updated.amountChf)).toBe(updatedAmountChf);
	expect(Number(updated.feesChf)).toBe(updatedFeesChf);
	expect(updated.status).toBe('pending');
});

test('does not show owner-only contribution rows under management', async ({ page }) => {
	const ownerOnly = await prisma.contribution.findUnique({
		where: { id: 'contribution-lr-high-1' },
		select: {
			contributor: {
				select: {
					contact: { select: { email: true } },
				},
			},
			campaign: {
				select: {
					slug: true,
				},
			},
		},
	});
	expect(ownerOnly?.contributor.contact?.email).toBeTruthy();
	expect(ownerOnly?.campaign.slug).toBeTruthy();
	const campaignTitle = await getCampaignTitle(ownerOnly!.campaign.slug!);

	await page.goto(
		`/portal/management/contributions?page=1&pageSize=10&search=${encodeURIComponent(ownerOnly!.contributor.contact.email!)}`,
	);
	await expect(page.getByText(campaignTitle, { exact: true })).toBeHidden();
});

test('shows validation error when contribution amount is invalid', async ({ page }) => {
	const source = await prisma.contribution.findFirst({
		select: {
			contributor: {
				select: {
					contact: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
				},
			},
			campaign: {
				select: {
					slug: true,
				},
			},
		},
	});
	expect(source).toBeTruthy();

	const contributorName =
		`${source!.contributor.contact?.firstName ?? ''} ${source!.contributor.contact?.lastName ?? ''}`.trim();
	const campaignTitle = await getCampaignTitle(source!.campaign.slug!);

	await page.goto('/portal/management/contributions');
	await clickDataTableActionItem(page, 'data-table-action-item-add-contribution');
	await selectOptionByTestId(page, 'contributor', contributorName);
	await selectOptionByTestId(page, 'campaign', campaignTitle);
	await page.getByTestId('form-item-amount').locator('input').fill('-1');
	await selectOptionByTestId(page, 'currency', 'USD');
	await page.getByTestId('form-item-amountChf').locator('input').fill('1');
	await page.getByTestId('form-item-feesChf').locator('input').fill('1');
	await selectOptionByTestId(page, 'status', 'succeeded');
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByText('Amount must be positive')).toBeVisible();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();
});
