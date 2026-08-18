import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

const loadSubscriptionContact = async (id: string) => {
	const subscription = await prisma.subscription.findUnique({
		where: { id },
		select: {
			stripeSubscriptionId: true,
			contributor: {
				select: {
					contact: {
						select: { email: true },
					},
				},
			},
		},
	});
	const email = subscription?.contributor.contact?.email;
	if (!subscription || !email) {
		throw new Error(`Missing email for subscription ${id}`);
	}

	return { email, stripeSubscriptionId: subscription.stripeSubscriptionId };
};

test('shows operator subscription rows under management', async ({ page }) => {
	const { email, stripeSubscriptionId } = await loadSubscriptionContact('subscription-core-high-stripe');
	if (!stripeSubscriptionId) {
		throw new Error('Expected operator subscription to have a Stripe ID');
	}

	await page.goto(`/portal/management/subscriptions?page=1&pageSize=10&search=${encodeURIComponent(email)}`);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page.getByText(email)).toBeVisible();
	await expect(page.getByText(stripeSubscriptionId, { exact: true })).toBeVisible();
});

test('does not show owner-only subscription rows under management', async ({ page }) => {
	const { email, stripeSubscriptionId } = await loadSubscriptionContact('subscription-lr-high-stripe');
	if (!stripeSubscriptionId) {
		throw new Error('Expected owner-only subscription to have a Stripe ID');
	}

	await page.goto(`/portal/management/subscriptions?page=1&pageSize=10&search=${encodeURIComponent(email)}`);
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page.getByText(stripeSubscriptionId, { exact: true })).toBeHidden();
});

test('subscription search sets the URL and shows matching rows', async ({ page }) => {
	const { email } = await loadSubscriptionContact('subscription-core-high-stripe');

	await page.goto('/portal/management/subscriptions');
	await expect(page.getByTestId('data-table')).toBeVisible();

	await page.getByTestId('data-table-search-button').click();
	await page.getByTestId('data-table-search-input').fill(email);
	await expect(page).toHaveURL((url) => url.searchParams.get('search') === email);
	await expect(page.getByText(email)).toBeVisible();
});

test('subscriptions table is read-only', async ({ page }) => {
	const { email } = await loadSubscriptionContact('subscription-core-high-stripe');

	await page.goto(`/portal/management/subscriptions?page=1&pageSize=10&search=${encodeURIComponent(email)}`);
	await expect(page.getByTestId('data-table')).toBeVisible();

	await expect(page.getByTestId('data-table-actions-button')).toHaveCount(0);
	await expect(page.getByTestId('action-cell-icon')).toHaveCount(0);

	await page.getByRole('row').filter({ hasText: email }).first().click();
	await expect(page.getByRole('heading', { name: /edit/i })).toHaveCount(0);
	await expect(page.getByTestId('dynamic-form')).toHaveCount(0);
});

test('empty subscription search shows no results', async ({ page }) => {
	await page.goto('/portal/management/subscriptions?page=1&pageSize=10&search=no-such-subscription');
	await expect(page.getByText('No subscriptions found')).toBeVisible();
});
