import { NextRequest } from 'next/server';
import { getVisitorCountry, getVisitorLocation } from './visitor-geo';

const request = (headers: Record<string, string>) => new NextRequest('https://socialincome.org/', { headers });

describe('getVisitorCountry', () => {
	test('returns known country codes, case-insensitively', () => {
		expect(getVisitorCountry(request({ 'x-vercel-ip-country': 'ch' }))).toBe('CH');
	});

	test('returns null for missing or unknown countries', () => {
		expect(getVisitorCountry(request({}))).toBeNull();
		expect(getVisitorCountry(request({ 'x-vercel-ip-country': 'XX' }))).toBeNull();
	});

	test('prefers the chosen country over the geo-IP country', () => {
		expect(getVisitorCountry(request({ cookie: 'si_country=DE', 'x-vercel-ip-country': 'CH' }))).toBe('DE');
	});

	test('ignores an invalid chosen country', () => {
		expect(getVisitorCountry(request({ cookie: 'si_country=XX', 'x-vercel-ip-country': 'CH' }))).toBe('CH');
	});
});

describe('getVisitorLocation', () => {
	test('passes countries through that the app does not know', () => {
		expect(getVisitorLocation(new Headers({ 'x-vercel-ip-country': 'XK' })).country).toBe('XK');
	});

	test('decodes the city', () => {
		expect(getVisitorLocation(new Headers({ 'x-vercel-ip-country': 'CH', 'x-vercel-ip-city': 'Z%C3%BCrich' }))).toEqual({
			country: 'CH',
			region: null,
			city: 'Zürich',
			ip: null,
		});
	});
});
