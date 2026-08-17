import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

test('shows operator subscription rows under management', async ({ page }) => {
	const existing = await prisma.subscription.findUnique({
		where: { id: 'subscription-core-high-stripe' },
		select: {
			stripeSubscriptionId: true,
			contributor: {
				select: {
					contact: { select: { email: true } },
				},
			},
			campaign: {
				select: { title: true },
			},
		},
	});
	expect(existing?.contributor.contact?.email).toBeTruthy();
	expect(existing?.campaign.title).toBeTruthy();

	await page.goto(
		`/portal/management/subscriptions?page=1&pageSize=10&search=${encodeURIComponent(existing!.contributor.contact.email!)}`,
	);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page.getByText(existing!.campaign.title, { exact: true })).toBeVisible();
	await expect(page.getByText(existing!.stripeSubscriptionId!, { exact: true })).toBeVisible();
});

test('does not show owner-only subscription rows under management', async ({ page }) => {
	const ownerOnly = await prisma.subscription.findUnique({
		where: { id: 'subscription-lr-high-stripe' },
		select: {
			contributor: {
				select: {
					contact: { select: { email: true } },
				},
			},
			campaign: {
				select: { title: true },
			},
		},
	});
	expect(ownerOnly?.contributor.contact?.email).toBeTruthy();
	expect(ownerOnly?.campaign.title).toBeTruthy();

	await page.goto(
		`/portal/management/subscriptions?page=1&pageSize=10&search=${encodeURIComponent(ownerOnly!.contributor.contact.email!)}`,
	);
	await expect(page.getByText(ownerOnly!.campaign.title, { exact: true })).toBeHidden();
});

test('subscription search sets the URL and shows matching rows', async ({ page }) => {
	await page.goto('/portal/management/subscriptions');
	await expect(page.getByTestId('data-table')).toBeVisible();

	await page.getByTestId('data-table-search-button').click();
	await page.getByTestId('data-table-search-input').fill('coreh@dashboard.test');
	await expect(page).toHaveURL(/search=coreh%40dashboard\.test/);
	await expect(page.getByText('coreh@dashboard.test')).toBeVisible();
});

test('subscriptions table is read-only', async ({ page }) => {
	await page.goto('/portal/management/subscriptions?page=1&pageSize=10&search=coreh%40dashboard.test');
	await expect(page.getByTestId('data-table')).toBeVisible();

	await expect(page.getByTestId('data-table-actions-button')).toHaveCount(0);
	await expect(page.getByTestId('action-cell-icon')).toHaveCount(0);

	await page.getByRole('row').filter({ hasText: 'coreh@dashboard.test' }).first().click();
	await expect(page.getByRole('heading', { name: /edit/i })).toHaveCount(0);
	await expect(page.getByTestId('dynamic-form')).toHaveCount(0);
});

test('empty subscription search shows no results', async ({ page }) => {
	await page.goto('/portal/management/subscriptions?page=1&pageSize=10&search=no-such-subscription');
	await expect(page.getByText('No subscriptions found')).toBeVisible();
});
