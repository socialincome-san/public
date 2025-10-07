import { ExchangeRate, Prisma } from '@prisma/client';

export const exchangeRatesData: ExchangeRate[] = [
	{
		id: 'exchange-rate-1',
		currency: 'SLL',
		rate: new Prisma.Decimal(25000),
		timestamp: new Date('2024-01-01T00:00:00Z'),
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'exchange-rate-2',
		currency: 'USD',
		rate: new Prisma.Decimal(0.90),
		timestamp: new Date('2024-01-01T00:00:00Z'),
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'exchange-rate-3',
		currency: 'EUR',
		rate: new Prisma.Decimal(0.95),
		timestamp: new Date('2024-01-01T00:00:00Z'),
		createdAt: new Date(),
		updatedAt: null
	}
];