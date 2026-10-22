import { getVisitorCountry, getVisitorLocation } from './visitor-geo';

describe('getVisitorCountry', () => {
	test('returns known country codes, case-insensitively', () => {
		expect(getVisitorCountry(new Headers({ 'x-vercel-ip-country': 'ch' }))).toBe('CH');
	});

	test('returns null for missing or unknown countries', () => {
		expect(getVisitorCountry(new Headers())).toBeNull();
		expect(getVisitorCountry(new Headers({ 'x-vercel-ip-country': 'XX' }))).toBeNull();
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
