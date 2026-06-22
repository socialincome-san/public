import { SurveyStatus } from '@/generated/prisma/enums';
import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, type Page, test } from '@playwright/test';
import { expectToHaveScreenshot } from '../../utils';

const SEEDED_SURVEY_URL =
	'/en/int/survey/candidate-sl-1/survey-recipient-candidate-sl-1-intake?email=candidate-sl-1%40survey.test&pw=seed-survey-pw';
const SEEDED_SURVEY_ID = 'survey-recipient-candidate-sl-1-intake';
const plannedAchievement = 'I want to use Social Income to grow my business and support my family.';

const advanceSeededSurveyToSecondStep = async (page: Page) => {
	await page.goto(SEEDED_SURVEY_URL);
	await page.getByRole('button', { name: 'Start' }).click();

	await expect(page.getByText('What do you hope to achieve within the next 3 years with Social Income?')).toBeVisible();
	await page.getByRole('textbox').fill(plannedAchievement);
	await page.getByRole('button', { name: 'Next', exact: true }).click();

	await expect(page.getByText('Where do you live?')).toBeVisible();
};

test.beforeEach(async () => {
	await seedDatabase();
});

test('seeded survey link opens the welcome page', async ({ page }) => {
	await page.goto(SEEDED_SURVEY_URL);

	await expect(page.getByText('Hello candidate_sl-1 candidate_pool')).toBeVisible();
	await expect(
		page.getByText(
			'The goal of this survey is to find out the impact of a Social Income for you. Takes around 5 minutes to complete.',
		),
	).toBeVisible();
});

test('survey saves progress when advancing to the next step', async ({ page }) => {
	await advanceSeededSurveyToSecondStep(page);

	await expect
		.poll(async () => {
			const survey = await prisma.survey.findUniqueOrThrow({
				where: { id: SEEDED_SURVEY_ID },
				select: { data: true, status: true },
			});

			return survey;
		})
		.toMatchObject({
			status: SurveyStatus.in_progress,
			data: {
				plannedAchievementV1: plannedAchievement,
			},
		});
});

test('survey second step matches screenshot', async ({ page }) => {
	await advanceSeededSurveyToSecondStep(page);
	await expectToHaveScreenshot(page);
});
