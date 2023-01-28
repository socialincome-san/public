import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('http://localhost:3000/');
	const popupPromise = page.waitForEvent('popup');
	await page.getByRole('button', { name: 'Sign in with Google' }).click();
	await page.waitForTimeout(4000); // todo replace this with better callbacks
	const popup = await popupPromise;
	await page.waitForTimeout(4000); // todo replace this with better callbacks
	await popup.getByText('person Admin admin@socialincome.org').click();
	await page.waitForTimeout(4000); // todo replace this with better callbacks
});

test('root', async ({ page }) => {
	await expect(page).toHaveScreenshot();
});

test('contributors', async ({ page }) => {
	// overview page
	await page.locator('ul').getByRole('link', { name: 'Contributors' }).click();
	await expect(page).toHaveScreenshot();

	// edit contributor
	await page.getByRole('button', { name: 'Edit cCj3O9gQuopmPZ15JTI0' }).click();
	await expect(page).toHaveScreenshot();
	await page.locator('#form_field_email').getByRole('textbox').fill('test@socialincome.org');
	await page.getByRole('button', { name: 'Save and close' }).click();
	await page.waitForTimeout(1000);
	await expect(page).toHaveScreenshot();

	// edit contribution
	await page.getByRole('button', { name: 'Edit cCj3O9gQuopmPZ15JTI0' }).click();
	await page.getByRole('button', { name: 'Edit 4isdwWikT8cY4CzUvArc' }).click();
	await page.locator('#form_field_amount').getByRole('spinbutton').fill('1000');
	await page.getByRole('button', { name: 'Save and close' }).click();
	await page.waitForTimeout(1000);
	await expect(page).toHaveScreenshot();
});

test('recipients', async ({ page }) => {
	// recipients overview page
	await page.locator('ul').getByRole('link', { name: 'Recipients' }).click();
	await expect(page).toHaveScreenshot();

	// test filtering
	await page.locator('div:nth-child(3) > .MuiBadge-root > .MuiButtonBase-root').click();
	await page.getByRole('spinbutton').click();
	await page.getByRole('spinbutton').fill('1');
	await expect(page).toHaveScreenshot();
	await page.getByText('Filter').click();
	await page.waitForTimeout(4000); // needs some time to filter
	await expect(page).toHaveScreenshot();
	await page.getByRole('button', { name: 'filter clear' }).click();
	await page.waitForTimeout(1000);
	await expect(page).toHaveScreenshot();

	// edit recipient
	await page.getByRole('button', { name: 'Edit iF8bLEoUjqOIlq84XQmi' }).click();
	await expect(page).toHaveScreenshot();
	await page.locator('#form_field_communication_mobile_phone').getByRole('spinbutton').fill('23300000500');
	await page.getByRole('button', { name: 'First Language' }).click();
	await page.getByRole('option', { name: 'Temne' }).click();
	await expect(page).toHaveScreenshot();
	// b) save form
	await page.locator('button', { hasText: 'Save and Close' }).click();
	await page.waitForTimeout(1000);
	// c) check if list got updated
	await expect(page).toHaveScreenshot();

	// create new payment
	await page.getByRole('button', { name: 'Edit iF8bLEoUjqOIlq84XQmi' }).click();
	await page.getByRole('button', { name: 'Add Payments' }).click();
	await page.getByRole('textbox', { name: 'ID' }).fill('123');
	await page.getByRole('button', { name: 'Currency' }).click();
	await page.getByRole('option', { name: 'SLE' }).click();
	await page.getByRole('button', { name: 'Status' }).click();
	await page.getByText('Confirmed').nth(1).click();
	await expect(page).toHaveScreenshot();
	// b) save form
	await page.locator('button', { hasText: 'Create and close' }).click();
	await page.waitForTimeout(1000);
	await expect(page).toHaveScreenshot();
	// c) add missing amount
	await page.getByRole('spinbutton').fill('1000');
	// d) save form again
	await page.locator('button', { hasText: 'Create and close' }).click();
	await page.waitForTimeout(1000);
	await expect(page).toHaveScreenshot();
});
