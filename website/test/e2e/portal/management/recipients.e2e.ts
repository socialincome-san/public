import { expect, test } from '@playwright/test';

test('Add new recipient', async ({ page }) => {
	await page.goto('http://localhost:3000/portal/management/recipients');
	await page.getByRole('button', { name: 'Add new recipient' }).click();

	await page.getByTestId('form-item-status').click();
	await page.getByRole('option', { name: 'waitlisted' }).click();

	await page.getByTestId('form-item-program').click();
	await page.getByRole('option', { name: 'Migros Relief SL' }).click();

	await page.getByTestId('form-item-localPartner').click();
	await page.getByRole('option', { name: 'Kenema Youth Foundation' }).click();

	await page.getByTestId('form-accordion-trigger-contact').click();

	await page.getByTestId('form-item-contact.firstName').locator('input').fill('Tony');
	await page.getByTestId('form-item-contact.lastName').locator('input').fill('Stark');

	await page.getByRole('button', { name: 'Save' }).click();

	await page.waitForTimeout(1000);
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('Edit existing recipient', async ({ page }) => {
	await page.goto('http://localhost:3000/portal/management/recipients');
	await page.getByRole('cell', { name: 'Tony' }).click();

	await page.getByTestId('form-item-startDate').locator('button').click();
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByLabel('Choose the Year').selectOption('2020');
	await page.getByRole('button', { name: 'Thursday, March 12th,' }).click();

	await page.getByTestId('form-item-successorName').locator('input').fill('Pepper Potts');

	await page.getByTestId('form-item-termsAccepted').locator('button').click();

	await page.getByTestId('form-item-program').click();
	await page.getByRole('option', { name: 'Migros Education SL' }).click();

	await page.getByTestId('form-item-localPartner').click();
	await page.getByRole('option', { name: 'Bo Women Empowerment Group' }).click();

	await page.getByTestId('form-accordion-trigger-paymentInformation').click();

	await page.getByTestId('form-item-paymentInformation.provider').click();
	await page.getByRole('option', { name: 'orange_money' }).click();

	await page.getByTestId('form-item-paymentInformation.code').locator('input').fill('OM123456');

	await page.getByTestId('form-item-paymentInformation.phone').locator('input').fill('+12345678901');

	await page.getByTestId('form-accordion-trigger-contact').click();

	await page.getByTestId('form-item-contact.callingName').locator('input').fill('Ironman');

	await page.getByRole('button', { name: 'Save' }).click();
	await page.waitForTimeout(1000);
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('Check if firebase auth user is created', async ({ page }) => {
	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill('+12345678901');
	await expect(page.getByRole('cell', { name: '+12345678901' })).toBeVisible();
});
