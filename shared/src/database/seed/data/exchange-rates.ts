import {
	ExchangeRateCollection as PrismaExchangeRateCollection,
	ExchangeRateItem as PrismaExchangeRateItem,
} from '@prisma/client';

export const exchangeRateCollectionsData: PrismaExchangeRateCollection[] = [
	{
		id: 'exchange-collection-1',
		base: 'CHF',
		timestamp: new Date(),
		createdAt: new Date(),
		updatedAt: null,
	},
];

export const exchangeRateItemsData: PrismaExchangeRateItem[] = [
	{
		id: 'exchange-item-chf',
		currency: 'CHF',
		rate: 1,
		collectionId: 'exchange-collection-1',
		createdAt: new Date(),
		updatedAt: null,
	},
	{
		id: 'exchange-item-usd',
		currency: 'USD',
		rate: 1.12,
		collectionId: 'exchange-collection-1',
		createdAt: new Date(),
		updatedAt: null,
	},
	{
		id: 'exchange-item-sle',
		currency: 'SLE',
		rate: 20,
		collectionId: 'exchange-collection-1',
		createdAt: new Date(),
		updatedAt: null,
	},
];