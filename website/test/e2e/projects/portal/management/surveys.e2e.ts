import { prisma } from '@/lib/database/prisma';
import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, Page, test } from '@playwright/test';
import { selectOptionByTestId } from '../../../utils';

const getEditableSurveys = async () => {
	const surveys = await prisma.survey.findMany({
		where: {
			recipient: {
				programId: { not: null },
			},
		},
		select: {
			id: true,
			name: true,
			accessEmail: true,
			recipientId: true,
			recipient: {
				select: {
					contact: {
						select: {
							firstName: true,
							lastName: true,
						},
					},
				},
			},
		},
		orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
		take: 3,
	});
	if (surveys.length < 2) {
		throw new Error('Expected at least two surveys in seed data.');
	}
	return surveys;
};

const openSurveyByName = async (page: Page, name: string) => {
	await page.goto(`/portal/management/surveys?page=1&pageSize=10&search=${encodeURIComponent(name)}`);
	await page.getByRole('cell', { name }).first().click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'visible' });
};

test.beforeEach(async () => {
	await seedDatabase();
});

test('updates a survey access password', async ({ page }) => {
	const [survey] = await getEditableSurveys();
	const nextPassword = `pw-${Date.now()}-updated`;

	await openSurveyByName(page, survey.name);
	await page.getByTestId('form-item-accessPw').locator('input').fill(nextPassword);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const updated = await prisma.survey.findUniqueOrThrow({
		where: { id: survey.id },
		select: { accessPw: true },
	});
	expect(updated.accessPw).toBe(nextPassword);
});

test('shows uniqueness error when survey access email already exists', async ({ page }) => {
	const [firstSurvey, secondSurvey] = await getEditableSurveys();

	await openSurveyByName(page, firstSurvey.name);
	await page.getByTestId('form-item-accessEmail').locator('input').fill(secondSurvey.accessEmail);
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByText('Error saving survey: A survey with this access email already exists.')).toBeVisible();
});

test('shows uniqueness error when survey name already exists for recipient', async ({ page }) => {
	const [firstSurvey, secondSurvey] = await getEditableSurveys();
	const secondRecipientName =
		`${secondSurvey.recipient.contact?.firstName ?? ''} ${secondSurvey.recipient.contact?.lastName ?? ''}`.trim();

	await openSurveyByName(page, firstSurvey.name);
	await page.getByTestId('form-item-name').locator('input').fill(secondSurvey.name);
	await selectOptionByTestId(page, 'recipientId', secondRecipientName);
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(
		page.getByText('Error saving survey: A survey with this name already exists for the selected recipient.'),
	).toBeVisible();
});
