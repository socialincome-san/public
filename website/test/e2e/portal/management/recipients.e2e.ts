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

	await page.waitForTimeout(2000);
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
	await page.getByTestId('form-item-paymentInformation.phone').locator('input').fill('+794772830');

	await page.getByTestId('form-accordion-trigger-contact').click();

	await page.getByTestId('form-item-contact.callingName').locator('input').fill('Ironman');
	await page.getByTestId('form-item-contact.email').locator('input').fill('tony.stark@example.com');

	await page.getByTestId('form-item-contact.language').click();
	await page.getByRole('option', { name: 'en' }).click();

	await page.getByTestId('form-item-contact.dateOfBirth').locator('button').click();
	await page.getByLabel('Choose the Year').selectOption('1996');
	await page.getByLabel('Choose the Month').selectOption('2');
	await page.getByRole('button', { name: 'Tuesday, March 12th,' }).click();

	await page.getByTestId('form-item-contact.profession').locator('input').fill('Engineer');

	await page.getByTestId('form-item-contact.gender').click();
	await page.getByRole('option', { name: 'female' }).click();

	// await page.getByTestId('form-item-contact.phone').locator('input').fill('+19876543210');
	// await page.getByTestId('form-item-contact.hasWhatsApp').locator('button').click();

	await page.getByTestId('form-item-contact.street').locator('input').fill('Main Street');
	await page.getByTestId('form-item-contact.number').locator('input').fill('42');
	await page.getByTestId('form-item-contact.city').locator('input').fill('Freetown');
	await page.getByTestId('form-item-contact.zip').locator('input').fill('1000');
	await page.getByTestId('form-item-contact.country').locator('input').fill('SL');

	await page.getByRole('button', { name: 'Save' }).click();

	await page.waitForTimeout(2000);
	await expect(page).toHaveScreenshot({ fullPage: true });
});

test('Check if firebase auth user is created', async ({ page }) => {
	await page.goto('http://localhost:4000/auth');
	await page.getByPlaceholder('Search by user UID, email address, phone number, or display name').fill('+794772830');
	await expect(page.getByRole('cell', { name: '+12345678901' })).toBeVisible();
});

test('CSV Upload', async ({ page }) => {
	await page.goto('http://localhost:3000/portal/management/recipients');

	await page.getByRole('button', { name: 'Upload CSV' }).click();
	await page.getByTestId('csv-dropzone-input').setInputFiles('./test/e2e/portal/management/upload-example.csv');
	await page.getByTestId('import-recipients-button').click();
	await page.getByRole('button', { name: 'Close' }).first().click();

	await page.waitForTimeout(2000);
	await expect(page).toHaveScreenshot({ fullPage: true });
});
