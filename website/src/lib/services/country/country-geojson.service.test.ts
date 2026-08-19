import type { ServiceResult } from '@/lib/services/core/base.types';
import { readFile } from 'node:fs/promises';
import { CountryGeoJsonService } from './country-geojson.service';
import { isCountryGeoJson } from './country-geojson.utils';

jest.mock('@/generated/prisma/client', () => ({
	PrismaClient: class {},
}));

jest.mock('node:fs/promises', () => ({
	readFile: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
	logger: {
		error: jest.fn(),
		warn: jest.fn(),
	},
}));

const mockedReadFile = jest.mocked(readFile);
const validFeatureCollection = {
	type: 'FeatureCollection',
	features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [] } }],
};

const expectSuccess = <T>(result: ServiceResult<T>) => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

describe('CountryGeoJsonService', () => {
	const service = new CountryGeoJsonService({} as never);

	beforeEach(() => {
		mockedReadFile.mockReset();
	});

	it('returns a typed FeatureCollection from the local GeoJSON file', async () => {
		mockedReadFile.mockResolvedValue(JSON.stringify(validFeatureCollection));

		const data = expectSuccess(await service.getCountries());

		expect(data).toEqual(validFeatureCollection);
		expect(mockedReadFile).toHaveBeenCalledWith(expect.stringContaining('public/assets/globe/countries-110m.json'), {
			encoding: 'utf8',
			signal: undefined,
		});
	});

	it('passes cancellation through to the file read', async () => {
		const controller = new AbortController();
		mockedReadFile.mockResolvedValue(JSON.stringify(validFeatureCollection));

		await service.getCountries(controller.signal);

		expect(mockedReadFile).toHaveBeenCalledWith(expect.any(String), {
			encoding: 'utf8',
			signal: controller.signal,
		});
	});

	it('returns a predictable failure for invalid GeoJSON', async () => {
		mockedReadFile.mockResolvedValue(JSON.stringify({ type: 'Invalid', features: [] }));

		await expect(service.getCountries()).resolves.toEqual({
			success: false,
			error: 'Country GeoJSON is not a valid FeatureCollection.',
		});
	});

	it('returns a predictable failure when the file is missing', async () => {
		mockedReadFile.mockRejectedValue(new Error('ENOENT: no such file or directory'));

		await expect(service.getCountries()).resolves.toEqual({
			success: false,
			error: 'Could not load country GeoJSON: ENOENT: no such file or directory',
		});
	});

	it('returns a predictable failure when loading is cancelled', async () => {
		mockedReadFile.mockRejectedValue(Object.assign(new Error('Aborted'), { name: 'AbortError' }));

		await expect(service.getCountries()).resolves.toEqual({
			success: false,
			error: 'Country GeoJSON loading was cancelled.',
		});
	});
});

describe('isCountryGeoJson', () => {
	it('accepts a FeatureCollection and rejects invalid payloads', () => {
		expect(isCountryGeoJson(validFeatureCollection)).toBe(true);
		expect(isCountryGeoJson({ type: 'FeatureCollection', features: [] })).toBe(true);
		expect(isCountryGeoJson({ type: 'FeatureCollection', features: 'invalid' })).toBe(false);
		expect(isCountryGeoJson({ type: 'FeatureCollection', features: [{ type: 'invalid' }] })).toBe(false);
		expect(isCountryGeoJson({ type: 'Polygon' })).toBe(false);
	});
});
