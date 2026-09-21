import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

export type CountryGeoJson = FeatureCollection<Geometry, GeoJsonProperties>;

export const COUNTRY_GEOJSON_URL = '/assets/globe/countries-110m.json';

export const getCountryGeoJson = async (signal?: AbortSignal): Promise<ServiceResult<CountryGeoJson>> => {
	try {
		const response = await fetch(COUNTRY_GEOJSON_URL, { signal });
		if (!response.ok) {
			return resultFail(`Country GeoJSON request failed with status ${response.status}.`, response.status);
		}

		const payload: unknown = await response.json();
		if (!isCountryGeoJson(payload)) {
			return resultFail('Country GeoJSON is not a valid FeatureCollection.');
		}

		return resultOk(payload);
	} catch (error) {
		if (isAbortError(error)) {
			return resultFail('Country GeoJSON loading was cancelled.');
		}

		console.error('Could not load country GeoJSON', { error });

		return resultFail('Could not load country GeoJSON.');
	}
};

export const isAbortError = (value: unknown): boolean => isRecord(value) && value.name === 'AbortError';

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

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
