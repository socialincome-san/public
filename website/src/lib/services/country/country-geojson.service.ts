import { BaseService } from '@/lib/services/core/base.service';
import type { ServiceResult } from '@/lib/services/core/base.types';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { CountryGeoJson } from './country-geojson.types';
import { isAbortError, isCountryGeoJson } from './country-geojson.utils';

const COUNTRY_GEOJSON_PATH = path.join(process.cwd(), 'public/assets/globe/countries-110m.json');

export class CountryGeoJsonService extends BaseService {
	async getCountries(signal?: AbortSignal): Promise<ServiceResult<CountryGeoJson>> {
		try {
			const contents = await readFile(COUNTRY_GEOJSON_PATH, { encoding: 'utf8', signal });
			const payload: unknown = JSON.parse(contents);

			if (!isCountryGeoJson(payload)) {
				return this.resultFail('Country GeoJSON is not a valid FeatureCollection.');
			}

			return this.resultOk(payload);
		} catch (error) {
			if (isAbortError(error)) {
				return this.resultFail('Country GeoJSON loading was cancelled.');
			}

			this.logger.error(error, { service: 'CountryGeoJsonService' });

			return this.resultFail(`Could not load country GeoJSON: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}
