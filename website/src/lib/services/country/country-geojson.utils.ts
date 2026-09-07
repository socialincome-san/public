import type { CountryGeoJson } from './country-geojson.types';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const isAbortError = (value: unknown) => isRecord(value) && value.name === 'AbortError';

export const isCountryGeoJson = (value: unknown): value is CountryGeoJson => {
	if (!isRecord(value) || value.type !== 'FeatureCollection' || !Array.isArray(value.features)) {
		return false;
	}

	return value.features.every(
		(feature) =>
			isRecord(feature) &&
			feature.type === 'Feature' &&
			(feature.geometry === null || (isRecord(feature.geometry) && typeof feature.geometry.type === 'string')),
	);
};
