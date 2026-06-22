import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';

test.beforeEach(async () => {
	await seedDatabase();
});

test('seeded survey link opens the welcome page', async ({ page }) => {
	await page.goto(
		'/en/int/survey/candidate-sl-1/survey-recipient-candidate-sl-1-intake?email=candidate-sl-1%40survey.test&pw=seed-survey-pw',
	);

	await expect(page.getByText('Hello candidate_sl-1 candidate_pool')).toBeVisible();
	await expect(
		page.getByText(
			'The goal of this survey is to find out the impact of a Social Income for you. Takes around 5 minutes to complete.',
		),
	).toBeVisible();
});
