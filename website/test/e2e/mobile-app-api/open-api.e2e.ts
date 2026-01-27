import { expect, test } from '@playwright/test';

test('OpenAPI JSON should match snapshot', async ({ page }) => {
	const response = await page.goto('/openapi.json');
	expect(response?.ok()).toBeTruthy();

	const text = await response!.text();
	const json = JSON.parse(text);

	const serialized = JSON.stringify(json, null, 2);

	expect(serialized).toMatchSnapshot('openapi.json');
});
