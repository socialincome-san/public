import type { CountryCode } from '@/generated/prisma/enums';
import { resultOk, type ServiceResult } from '@/lib/service-result';

const WORLD_BANK_BASE_URL = 'https://api.worldbank.org/v2/country';
const WORLD_BANK_RECENT_VALUE_COUNT = 10;
const WORLD_BANK_REVALIDATE_SECONDS = 60 * 60 * 24;

export const fetchWorldBankIndicator = async (
	countryCode: CountryCode,
	indicator: string,
): Promise<ServiceResult<number | null>> => {
	try {
		const query = new URLSearchParams({
			format: 'json',
			mrv: WORLD_BANK_RECENT_VALUE_COUNT.toString(),
			per_page: WORLD_BANK_RECENT_VALUE_COUNT.toString(),
		});
		const response = await fetch(`${WORLD_BANK_BASE_URL}/${countryCode}/indicator/${indicator}?${query.toString()}`, {
			next: { revalidate: WORLD_BANK_REVALIDATE_SECONDS },
		});
		if (!response.ok) {
			return resultOk(null);
		}

		const payload: unknown = await response.json();

		return resultOk(extractLatestWorldBankValue(payload));
	} catch {
		return resultOk(null);
	}
};

const extractLatestWorldBankValue = (payload: unknown): number | null => {
	if (!Array.isArray(payload)) {
		return null;
	}

	const entries: unknown = payload[1];
	if (!Array.isArray(entries)) {
		return null;
	}

	const latestEntry = entries.find(hasWorldBankIndicatorValue);
	if (!latestEntry) {
		return null;
	}

	const { value } = latestEntry;
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === 'string') {
		const parsedValue = Number(value);

		return Number.isFinite(parsedValue) ? parsedValue : null;
	}

	return null;
};

const hasWorldBankIndicatorValue = (entry: unknown): entry is { value: number | string } =>
	typeof entry === 'object' &&
	entry !== null &&
	'value' in entry &&
	(typeof entry.value === 'number' || typeof entry.value === 'string');
