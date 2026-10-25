import { GET } from './route';

describe('newsletter archive content route', () => {
	it('returns the archived newsletter with safe rendering headers and resolved placeholders', async () => {
		const response = await GET(new Request('https://socialincome.org'), {
			params: Promise.resolve({ lang: 'en', currency: 'usd', newsletterId: '2026-10' }),
		});
		const html = await response.text();

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
		expect(response.headers.get('content-security-policy')).toContain("script-src 'none'");
		expect(html).toContain('Shoes, Stablecoins and Schools.');
		expect(html).not.toMatch(/\{\{\s*insert\s+first_name/i);
		expect(html).toMatch(/href="https:\/\/[^"]+" target="_blank" rel="noopener noreferrer"/i);
	});

	it('returns 404 for invalid locales, currencies, and newsletter IDs', async () => {
		const contexts = [
			{ lang: 'xx', currency: 'usd', newsletterId: '2026-10' },
			{ lang: 'en', currency: 'cad', newsletterId: '2026-10' },
			{ lang: 'en', currency: 'usd', newsletterId: '9999-12' },
		];

		for (const params of contexts) {
			const response = await GET(new Request('https://socialincome.org'), { params: Promise.resolve(params) });

			expect(response.status).toBe(404);
		}
	});
});
