import { COUNTRY_GEOJSON_URL, getCountryGeoJson } from './country-geojson.client';

jest.mock('@/lib/utils/logger', () => ({
	logger: {
		error: jest.fn(),
		warn: jest.fn(),
	},
}));

const validFeatureCollection = {
	type: 'FeatureCollection',
	features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [] } }],
};

describe('getCountryGeoJson', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('loads and validates the local country data', async () => {
		const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
			new Response(JSON.stringify(validFeatureCollection), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		);

		const result = await getCountryGeoJson();

		expect(fetchMock).toHaveBeenCalledWith(COUNTRY_GEOJSON_URL, {
			signal: undefined,
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(validFeatureCollection);
		}
	});

	it('returns a predictable failure for invalid GeoJSON', async () => {
		jest.spyOn(global, 'fetch').mockResolvedValue(
			new Response(JSON.stringify({ type: 'Invalid', features: [] }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		);

		await expect(getCountryGeoJson()).resolves.toEqual({
			success: false,
			error: 'Country GeoJSON is not a valid FeatureCollection.',
			status: undefined,
		});
	});

	it('returns a predictable failure when the file is unavailable', async () => {
		jest.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 503 }));

		await expect(getCountryGeoJson()).resolves.toEqual({
			success: false,
			error: 'Country GeoJSON request failed with status 503.',
			status: 503,
		});
	});

	it('passes cancellation to fetch', async () => {
		const controller = new AbortController();
		jest.spyOn(global, 'fetch').mockRejectedValue(new DOMException('Aborted', 'AbortError'));

		await expect(getCountryGeoJson(controller.signal)).resolves.toEqual({
			success: false,
			error: 'Country GeoJSON loading was cancelled.',
			status: undefined,
		});
	});
});
