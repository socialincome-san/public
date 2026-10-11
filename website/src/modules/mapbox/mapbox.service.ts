import {
	getCountryStaticMapUrl as buildCountryStaticMapUrl,
	type MapboxMapVariant,
} from '@/integrations/mapbox/mapbox.integration';
import type { Result } from '@/lib/result';

export const getCountryStaticMapUrl = async (
	accessToken: string,
	isoCode: string,
	variant: MapboxMapVariant,
): Promise<Result<string | null>> => buildCountryStaticMapUrl({ accessToken, isoCode, variant });
