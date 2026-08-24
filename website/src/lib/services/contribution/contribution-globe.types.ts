import type { CountryCode, Currency } from '@/generated/prisma/enums';

export type GlobeContributionRow = {
	id: string;
	amount: number;
	currency: Currency;
	createdAt: Date;
	countryCode: CountryCode | null;
};

export type GlobeContribution = {
	key: string;
	amount: number;
	currency: string;
	contributedAt: string;
	countryCode: string;
	countryName: string;
};
