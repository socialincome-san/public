import { CountryMobileMoneyProviderMapping } from '@/generated/prisma/client';

const createdAt = new Date('2025-01-01T13:00:00.000Z');

export const countryMobileMoneyProviderMappingsData: CountryMobileMoneyProviderMapping[] = [
	{
		id: 'country-mobile-money-provider-mapping-sl-orange',
		countryId: 'country-sierra-leone',
		mobileMoneyProviderId: 'mobile-money-provider-id-1',
		createdAt,
		updatedAt: null,
	},
	{
		id: 'country-mobile-money-provider-mapping-lr-orange',
		countryId: 'country-liberia',
		mobileMoneyProviderId: 'mobile-money-provider-id-1',
		createdAt,
		updatedAt: null,
	},
	{
		id: 'country-mobile-money-provider-mapping-gh-yellow',
		countryId: 'country-ghana',
		mobileMoneyProviderId: 'mobile-money-provider-id-2',
		createdAt,
		updatedAt: null,
	},
	{
		id: 'country-mobile-money-provider-mapping-ke-yellow',
		countryId: 'country-kenya',
		mobileMoneyProviderId: 'mobile-money-provider-id-2',
		createdAt,
		updatedAt: null,
	},
	{
		id: 'country-mobile-money-provider-mapping-mw-orange',
		countryId: 'country-malawi',
		mobileMoneyProviderId: 'mobile-money-provider-id-1',
		createdAt,
		updatedAt: null,
	},
];

