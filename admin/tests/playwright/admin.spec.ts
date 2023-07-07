import { test as base, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export const test = base.extend({
	context: async ({ context }, use) => {
		const sessionStorage = JSON.parse(
			fs.readFileSync(path.join(__dirname, 'sessionStorage.json'), { encoding: 'utf8' }),
		);
		await context.addInitScript((storage: string) => {
			for (const [key, value] of Object.entries(storage)) {
				window.sessionStorage.setItem(key, value as string);
			}
		}, sessionStorage);
		await use(context);
	},
});

test.beforeAll(async ({ browser }) => {
	console.log('Logging in and writing sessionStorage.json file.');
	const context = await browser.newContext();
	const page = await context.newPage();
	await page.goto('http://localhost:3000/');
	const popupPromise = page.waitForEvent('popup');
	await page.getByRole('button', { name: 'Sign in with Google' }).click();
	await page.waitForTimeout(2000); // todo replace this with better callbacks
	const popup = await popupPromise;
	await page.waitForTimeout(2000); // todo replace this with better callbacks
	await popup.getByText('person Admin admin@socialincome.org').click();
	await page.waitForTimeout(2000); // todo replace this with better callbacks
	const sessionStorage: string = await page.evaluate(() => JSON.stringify(sessionStorage));
	await page.close();
	await context.close();
	fs.writeFileSync(path.join(__dirname, 'sessionStorage.json'), sessionStorage, { encoding: 'utf8' });
});

test.beforeEach(async ({ page }) => {
	await page.goto('http://localhost:3000/');
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
	await page.locator('#form_field_address').getByRole('textbox').nth(4).fill('24');
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

	await page.getByRole('button', { name: 'All Recipients' }).click();

	// edit recipient
	await page.getByRole('button', { name: 'Edit iF8bLEoUjqOIlq84XQmi' }).click();
	await expect(page).toHaveScreenshot();
	await page.locator('#form_field_communication_mobile_phone').getByRole('spinbutton').fill('23300000500');
	await page.getByRole('button', { name: 'First Language' }).click();
	await page.getByRole('option', { name: 'Temne' }).click();
	await expect(page).toHaveScreenshot();
	await page.locator('button', { hasText: 'Save and Close' }).click();
	await page.waitForTimeout(1000);
	await expect(page).toHaveScreenshot();

	// create new payment
	await page.getByRole('button', { name: 'Edit iF8bLEoUjqOIlq84XQmi' }).click();
	await page.getByRole('button', { name: 'Add Payments' }).click();
	await page.getByRole('textbox', { name: 'ID' }).fill('123');
	await page.getByRole('spinbutton').fill('1000');
	await page.getByRole('button', { name: 'Currency' }).click();
	await page.getByRole('option', { name: 'SLE' }).click();
	await page.getByRole('button', { name: 'Status' }).click();
	await page.getByText('Confirmed').nth(1).click();
	await page.locator('button', { hasText: 'Create and close' }).click();
	await page.waitForTimeout(1000);
	await expect(page).toHaveScreenshot();
});
