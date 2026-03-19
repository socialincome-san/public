import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, Page, test } from '@playwright/test';
import { addDays, startOfDay } from 'date-fns';

const parseStartsIn = (value: string): number => {
	const trimmed = value.trim();
	if (trimmed === 'Today') {
		return 0;
	}

	const match = /^In (\d+) day(?:s)?$/i.exec(trimmed);
	if (!match) {
		throw new Error(`Unexpected "Starts in" value: "${value}"`);
	}

	return Number(match[1]);
};

const getStartsInValues = async (page: Page): Promise<number[]> => {
	const rows = page.locator('tbody tr');
	const rowCount = await rows.count();
	const values: number[] = [];

	for (let i = 0; i < rowCount; i += 1) {
		const startsInCell = rows.nth(i).locator('td').nth(2);
		values.push(parseStartsIn(await startsInCell.innerText()));
	}

	return values;
};

const prepareUpcomingOnboardingRecipients = async () => {
	const today = startOfDay(new Date());

	await prisma.recipient.updateMany({
		where: {
			programId: { not: null },
		},
		data: {
			startDate: addDays(today, -365),
		},
	});

	await prisma.recipient.update({
		where: { id: 'recipient-1' },
		data: { startDate: addDays(today, 2) },
	});

	await prisma.recipient.update({
		where: { id: 'recipient-2' },
		data: { startDate: addDays(today, 5) },
	});
};

test.beforeEach(async () => {
	await seedDatabase();
	await prepareUpcomingOnboardingRecipients();
});

test('monitoring upcoming onboarding page renders table and tab', async ({ page }) => {
	await page.goto('/portal/monitoring/upcoming-onboarding');

	await expect(page.getByRole('link', { name: 'Upcoming Onboarding' })).toBeVisible();
	await expect(page.getByRole('heading', { name: /Upcoming Onboarding/i })).toBeVisible();
	await expect(page.getByTestId('data-table')).toBeVisible();
});

test('monitoring upcoming onboarding sorts by starts in ascending and descending', async ({ page }) => {
	await page.goto('/portal/monitoring/upcoming-onboarding?sortBy=daysUntilStart&sortDirection=asc');
	await expect(page.getByTestId('data-table')).toBeVisible();

	const ascValues = await getStartsInValues(page);
	expect(ascValues.length).toBeGreaterThan(0);
	expect(ascValues).toEqual([...ascValues].sort((a, b) => a - b));

	await page.goto('/portal/monitoring/upcoming-onboarding?sortBy=daysUntilStart&sortDirection=desc');
	await expect(page.getByTestId('data-table')).toBeVisible();

	const descValues = await getStartsInValues(page);
	expect(descValues.length).toBeGreaterThan(0);
	expect(descValues).toEqual([...descValues].sort((a, b) => b - a));
});
