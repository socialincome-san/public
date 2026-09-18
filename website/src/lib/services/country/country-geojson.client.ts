import type { ServiceResult } from '@/lib/services/core/base.types';
import { resultFail, resultOk } from '@/lib/services/core/service-result';
import type { CountryGeoJson } from './country-geojson.types';
import { isAbortError, isCountryGeoJson } from './country-geojson.utils';

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

		console.error(error, { service: 'CountryGeoJsonClient' });

		return resultFail(`Could not load country GeoJSON: ${error instanceof Error ? error.message : String(error)}`);
	}
};
