import { expect, test } from '@playwright/test';

const SECURITY_HEADER_NAMES = [
	'content-security-policy',
	'x-content-type-options',
	'referrer-policy',
	'permissions-policy',
] as const;

test('security headers match snapshot', async ({ page }) => {
	const response = await page.goto('/en/ch');

	if (!response) {
		throw new Error('Expected a response from /en/ch');
	}

	expect(response.ok()).toBeTruthy();

	const headers = response.headers();
	const securityHeaders = Object.fromEntries(SECURITY_HEADER_NAMES.map((name) => [name, headers[name] ?? null]));

	expect(JSON.stringify(securityHeaders, null, 2)).toMatchSnapshot();
});
