import { services } from '@/lib/services/services';

export type CountryPageStats = {
	activeProgramsCount: number;
	recipientsCount: number;
};

const emptyStats: CountryPageStats = {
	activeProgramsCount: 0,
	recipientsCount: 0,
};

export const getCountryPageStats = async (isoCode: string): Promise<CountryPageStats> => {
	const normalizedIsoCode = isoCode.trim();
	if (!normalizedIsoCode || normalizedIsoCode === '-') {
		return emptyStats;
	}

	const statsResult = await services.read.country.getPublicCountryStatsByIsoCode(normalizedIsoCode);

	if (!statsResult.success) {
		return emptyStats;
	}

	return {
		activeProgramsCount: statsResult.data.programsCount,
		recipientsCount: statsResult.data.recipientsCount,
	};
};
