import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { getFirebaseAdminService, getPrismaClient } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
});

test('admin local partners page matches screenshot', async ({ page }) => {
	await page.goto('/portal/admin/local-partners');
	await expect(page.getByTestId('data-table')).toBeVisible();
	await expect(page).toHaveScreenshot({ fullPage: true });
});

const expectedPartner = {
	name: 'Avengers',
	firstName: 'Carol',
	lastName: 'Danvers',
	email: 'captain.marvel@avengers.com',
};

test('Add new local partner', async ({ page }) => {
	const firebaseService = await getFirebaseAdminService();
	await firebaseService.deleteByEmailIfExists(expectedPartner.email);

	await page.goto('/portal/admin/local-partners');
	await page.getByTestId('data-table-actions-button').click();
	await page.getByTestId('data-table-action-item-add-new-local-partner').click();

	await page.getByTestId('form-item-name').locator('input').fill(expectedPartner.name);

	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(expectedPartner.firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(expectedPartner.lastName);
	await page.getByTestId('form-item-contact.email').locator('input').fill(expectedPartner.email);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const prisma = await getPrismaClient();
	const count = await prisma.localPartner.count();
	expect(count).toBe(4);

	const row = await prisma.localPartner.findFirst({
		where: { name: expectedPartner.name },
		select: {
			contact: {
				select: {
					firstName: true,
					lastName: true,
				},
			},
		},
	});

	expect(row).toBeDefined();
	expect(`${row?.contact?.firstName ?? ''} ${row?.contact?.lastName ?? ''}`.trim()).toBe(
		`${expectedPartner.firstName} ${expectedPartner.lastName}`,
	);

	await page.goto('http://localhost:4000/auth');
	await page
		.getByPlaceholder('Search by user UID, email address, phone number, or display name')
		.fill(expectedPartner.email);
	await expect(
		page.getByRole('cell', { name: `${expectedPartner.firstName} ${expectedPartner.lastName}` }),
	).toBeVisible();
});
