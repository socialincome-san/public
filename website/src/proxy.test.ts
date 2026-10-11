import { NextRequest } from 'next/server';
import { proxy } from './proxy';

const request = (path: string, headers: Record<string, string> = {}) =>
	new NextRequest(new URL(path, 'https://socialincome.org'), { headers });

const redirectOf = (path: string, headers?: Record<string, string>) => {
	const response = proxy(request(path, headers));

	return { status: response.status, location: response.headers.get('location') };
};

describe('proxy', () => {
	test('passes complete language and currency URLs through without looking at the visitor', () => {
		const response = proxy(request('/de/chf/programs?country=SL', { 'x-vercel-ip-country': 'US' }));

		expect(response.headers.get('location')).toBeNull();
		expect(response.headers.get('x-middleware-next')).toBe('1');
		expect(response.headers.get('set-cookie')).toBeNull();
	});

	test('permanently redirects old region URLs and keeps path and query', () => {
		expect(redirectOf('/de/ch/programs/foo?country=SL')).toEqual({
			status: 308,
			location: 'https://socialincome.org/de/chf/programs/foo?country=SL',
		});
		expect(redirectOf('/en/int')).toEqual({ status: 308, location: 'https://socialincome.org/en/usd' });
		expect(redirectOf('/fr/int/journal/', { 'x-vercel-ip-country': 'CH' })).toEqual({
			status: 308,
			location: 'https://socialincome.org/fr/usd/journal/',
		});
	});

	test('permanently redirects upper-case currency segments to the lower-case URL', () => {
		expect(redirectOf('/it/EUR/campaigns')).toEqual({ status: 308, location: 'https://socialincome.org/it/eur/campaigns' });
	});

	test('adds the visitor currency when a language URL has no currency', () => {
		expect(redirectOf('/de/programs?x=1', { 'x-vercel-ip-country': 'DE' })).toEqual({
			status: 307,
			location: 'https://socialincome.org/de/eur/programs?x=1',
		});
		expect(redirectOf('/de', { 'x-vercel-ip-country': 'CH' })).toEqual({
			status: 307,
			location: 'https://socialincome.org/de/chf',
		});
	});

	test('treats an unknown currency segment as part of the page path', () => {
		expect(redirectOf('/en/gbp/programs', { 'x-vercel-ip-country': 'US' })).toEqual({
			status: 307,
			location: 'https://socialincome.org/en/usd/gbp/programs',
		});
	});

	test('picks language and currency for URLs without a prefix', () => {
		expect(
			redirectOf('/dashboard/subscriptions?id=1', {
				'accept-language': 'fr-CH,fr;q=0.9,en;q=0.8',
				'x-vercel-ip-country': 'CH',
			}),
		).toEqual({ status: 307, location: 'https://socialincome.org/fr/chf/dashboard/subscriptions?id=1' });
		expect(redirectOf('/', { 'accept-language': 'de', 'x-vercel-ip-country': 'AT' })).toEqual({
			status: 307,
			location: 'https://socialincome.org/de/eur',
		});
	});

	test('redirects to the new URL in one step and never back to itself', () => {
		const first = redirectOf('/de/ch');
		const next = proxy(request(new URL(first.location ?? '').pathname));

		expect(next.headers.get('location')).toBeNull();
	});

	test('ignores old cookies when the URL is complete', () => {
		const response = proxy(
			request('/en/eur/programs', { cookie: 'si_currency=CHF; si_lang=de; si_region=ch', 'x-vercel-ip-country': 'CH' }),
		);

		expect(response.headers.get('location')).toBeNull();
	});
});
