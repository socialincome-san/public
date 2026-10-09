import { NextRequest } from 'next/server';
import { findBestLocale, getWebsiteBasePath, parseCurrencySegment, toCurrencySegment, toWebsiteCurrency } from './utils';

const request = (headers: Record<string, string>) => new NextRequest('https://socialincome.org/', { headers });

describe('currency segments', () => {
	test('maps internal currencies to lower-case URL segments and back', () => {
		expect(toCurrencySegment('CHF')).toBe('chf');
		expect(parseCurrencySegment('eur')).toBe('EUR');
		expect(getWebsiteBasePath('de', 'CHF')).toBe('/de/chf');
	});

	test('rejects old regions, upper-case codes and other currencies', () => {
		for (const segment of ['ch', 'int', 'USD', 'gbp', 'constructor', '', undefined]) {
			expect(parseCurrencySegment(segment)).toBeUndefined();
		}
		expect(toWebsiteCurrency('gbp')).toBe('USD');
	});
});

describe('findBestLocale', () => {
	test('uses the first supported browser language and the geo-IP currency', () => {
		expect(findBestLocale(request({ 'accept-language': 'es,it;q=0.9,de;q=0.8', 'x-vercel-ip-country': 'DE' }))).toEqual({
			language: 'it',
			currency: 'EUR',
		});
	});

	test('falls back to the Accept-Language region without a geo header', () => {
		expect(findBestLocale(request({ 'accept-language': 'de-CH' }))).toEqual({ language: 'de', currency: 'CHF' });
	});

	test('falls back to English and USD for countries without a website currency', () => {
		expect(findBestLocale(request({ 'accept-language': 'kri', 'x-vercel-ip-country': 'SL' }))).toEqual({
			language: 'en',
			currency: 'USD',
		});
		expect(findBestLocale(request({}))).toEqual({ language: 'en', currency: 'USD' });
	});
});
