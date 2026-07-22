import { expect, test } from '@playwright/test';

const expectSecurityHeaders = (headers: Record<string, string>) => {
	expect(headers['content-security-policy']).toBeTruthy();
	expect(headers['content-security-policy']).toContain("default-src 'self'");
	expect(headers['x-content-type-options']).toBe('nosniff');
	expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
	expect(headers['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
};

test('security headers are present on the homepage', async ({ page }) => {
	const response = await page.goto('/en/ch');

	expect(response?.ok()).toBeTruthy();
	expectSecurityHeaders(response?.headers() ?? {});
});

test('security headers are present on portal routes', async ({ page }) => {
	const response = await page.goto('/portal');

	expect(response?.ok()).toBeTruthy();
	expectSecurityHeaders(response?.headers() ?? {});
});

test('storybook keeps noindex and includes security headers', async ({ page }) => {
	const response = await page.goto('/storybook/index.html?path=/docs/design-system--docs');

	expect(response?.ok()).toBeTruthy();
	expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
	expectSecurityHeaders(response?.headers() ?? {});
});
