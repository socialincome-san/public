import { seedDatabase } from '@/lib/database/seed/run-seed';
import { expect, test } from '@playwright/test';
import { getFirebaseAdminService, getLocalPartnerService } from '../../utils';

test.beforeEach(async () => {
	await seedDatabase();
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
	await page.getByRole('button', { name: 'Add new local partner' }).click();

	await page.getByTestId('form-item-name').locator('input').fill(expectedPartner.name);

	await page.getByTestId('form-accordion-trigger-contact').click();
	await page.getByTestId('form-item-contact.firstName').locator('input').fill(expectedPartner.firstName);
	await page.getByTestId('form-item-contact.lastName').locator('input').fill(expectedPartner.lastName);
	await page.getByTestId('form-item-contact.email').locator('input').fill(expectedPartner.email);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.getByTestId('dynamic-form').waitFor({ state: 'detached' });

	const service = await getLocalPartnerService();
	const result = await service.getTableView('user-2');

	if (!result.success) throw new Error(result.error);

	expect(result.data.tableRows.length).toBe(4);

	const row = result.data.tableRows.find((r) => r.name === expectedPartner.name);

	expect(row).toBeDefined();
	expect(row?.contactPerson).toBe(`${expectedPartner.firstName} ${expectedPartner.lastName}`);

	await page.goto('http://localhost:4000/auth');
	await page
		.getByPlaceholder('Search by user UID, email address, phone number, or display name')
		.fill(expectedPartner.email);
	await expect(
		page.getByRole('cell', { name: `${expectedPartner.firstName} ${expectedPartner.lastName}` }),
	).toBeVisible();
});
