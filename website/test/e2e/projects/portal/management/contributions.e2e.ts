import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { clickDataTableActionItem, selectOptionByTestId } from '../../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

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
					title: true,
				},
			},
		},
	});
	expect(source).toBeTruthy();

	const contributorName =
		`${source!.contributor.contact?.firstName ?? ''} ${source!.contributor.contact?.lastName ?? ''}`.trim();
	const campaignTitle = source!.campaign.title;
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

test.only('edit contribution', async ({ page }) => {
	const existing = await prisma.contribution.findFirst({
		where: {
			contributor: {
				contact: {
					email: { not: null },
				},
			},
		},
		select: {
			id: true,
			contributor: {
				select: {
					contact: { select: { email: true } },
				},
			},
		},
	});
	expect(existing).toBeTruthy();

	const updatedAmount = 123.45;
	const updatedAmountChf = 111.11;
	const updatedFeesChf = 2.22;

	await page.goto(`/portal/management/contributions?page=1&pageSize=10&search=${encodeURIComponent(existing!.id)}`);
	await page.getByRole('row').filter({ hasText: existing!.id }).first().click();
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
					title: true,
				},
			},
		},
	});
	expect(source).toBeTruthy();

	const contributorName =
		`${source!.contributor.contact?.firstName ?? ''} ${source!.contributor.contact?.lastName ?? ''}`.trim();

	await page.goto('/portal/management/contributions');
	await clickDataTableActionItem(page, 'data-table-action-item-add-contribution');
	await selectOptionByTestId(page, 'contributor', contributorName);
	await selectOptionByTestId(page, 'campaign', source!.campaign.title);
	await page.getByTestId('form-item-amount').locator('input').fill('-1');
	await selectOptionByTestId(page, 'currency', 'USD');
	await page.getByTestId('form-item-amountChf').locator('input').fill('1');
	await page.getByTestId('form-item-feesChf').locator('input').fill('1');
	await selectOptionByTestId(page, 'status', 'succeeded');
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByText('Amount must be positive')).toBeVisible();
	await expect(page.getByTestId('dynamic-form')).toBeVisible();
});
