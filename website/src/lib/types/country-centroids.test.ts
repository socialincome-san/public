import type { CountryCode } from '@/generated/prisma/enums';
import { COUNTRY_CENTROIDS, getCountryCentroid } from './country-centroids';

describe('COUNTRY_CENTROIDS', () => {
	it('returns a centroid for Switzerland', () => {
		const centroid = getCountryCentroid('CH');
		expect(centroid).toEqual({ lat: 46.82, lng: 8.23 });
	});

	it('returns a centroid for United States', () => {
		const centroid = getCountryCentroid('US');
		expect(centroid).not.toBeNull();
		expect(centroid!.lat).toBeGreaterThan(20);
		expect(centroid!.lat).toBeLessThan(60);
	});

	it('returns null for an unmapped country code', () => {
		const centroid = getCountryCentroid('AQ' as CountryCode);
		expect(centroid).toBeNull();
	});

	it('covers common contributor origin countries', () => {
		const expected: CountryCode[] = ['CH', 'DE', 'FR', 'GB', 'US', 'CA', 'AU', 'SE', 'NO'];
		for (const code of expected) {
			expect(getCountryCentroid(code)).not.toBeNull();
		}
	});

	it('has valid lat/lng ranges for all defined entries', () => {
		for (const [code, centroid] of Object.entries(COUNTRY_CENTROIDS)) {
			expect(centroid!.lat).toBeGreaterThanOrEqual(-90);
			expect(centroid!.lat).toBeLessThanOrEqual(90);
			expect(centroid!.lng).toBeGreaterThanOrEqual(-180);
			expect(centroid!.lng).toBeLessThanOrEqual(180);
			expect(typeof code).toBe('string');
			expect(code.length).toBe(2);
		}
	});
});
