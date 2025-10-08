import { ExchangeRate, Prisma } from '@prisma/client';

export const exchangeRatesData: ExchangeRate[] = [
	{
		id: 'exchange-rate-1',
		currency: 'CHF',
		rate: new Prisma.Decimal(1.0),
		timestamp: new Date('2025-01-01T00:00:00Z'),
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'exchange-rate-2',
		currency: 'USD',
		rate: new Prisma.Decimal(1.08),
		timestamp: new Date('2025-01-01T00:00:00Z'),
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'exchange-rate-3',
		currency: 'EUR',
		rate: new Prisma.Decimal(0.95),
		timestamp: new Date('2025-01-01T00:00:00Z'),
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'exchange-rate-4',
		currency: 'SLE',
		rate: new Prisma.Decimal(24.0),
		timestamp: new Date('2025-01-01T00:00:00Z'),
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'exchange-rate-5',
		currency: 'LRD',
		rate: new Prisma.Decimal(203.0),
		timestamp: new Date('2025-01-01T00:00:00Z'),
		createdAt: new Date(),
		updatedAt: null
	}
];