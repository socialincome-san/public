import { isCountryGeoJson } from '@/lib/services/country/country-geojson.utils';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { GLOBE_COLORS, GLOBE_SPHERE_OPACITY } from './globe-config';

describe('generated globe fallback', () => {
	it('is generated from a valid Natural Earth FeatureCollection', async () => {
		const payload: unknown = JSON.parse(
			await readFile(path.join(process.cwd(), 'public/assets/globe/countries-110m.json'), 'utf8'),
		);

		expect(isCountryGeoJson(payload)).toBe(true);
		if (isCountryGeoJson(payload)) {
			expect(payload.features.length).toBeGreaterThan(50);
			expect(payload.features.every((feature) => feature.properties === null)).toBe(true);
		}
	});

	it('contains the sphere and projected Natural Earth country shapes', async () => {
		const svg = await readFile(path.join(process.cwd(), 'public/assets/globe/globe-fallback.svg'), 'utf8');
		const countryPaths = svg.match(/<path /g) ?? [];

		expect(svg).toContain(`<circle`);
		expect(svg).toContain(`fill="${GLOBE_COLORS.sphere}"`);
		expect(svg).toContain(`fill-opacity="${GLOBE_SPHERE_OPACITY}"`);
		expect(svg).toContain(`fill="${GLOBE_COLORS.hexagon}"`);
		expect(countryPaths.length).toBeGreaterThan(50);
	});
});
