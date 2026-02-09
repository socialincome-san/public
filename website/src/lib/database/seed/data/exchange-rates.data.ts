import { ExchangeRate, Prisma } from '@/generated/prisma/client';

export const exchangeRatesData: ExchangeRate[] = [
	{
		id: 'exchange-rate-1',
		legacyFirestoreId: null,
		currency: 'CHF',
		rate: new Prisma.Decimal(1.0),
		timestamp: new Date('2025-01-01T00:00:00Z'),
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'exchange-rate-2',
		legacyFirestoreId: null,
		currency: 'USD',
		rate: new Prisma.Decimal(0.85),
		timestamp: new Date('2025-01-01T00:00:00Z'),
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'exchange-rate-3',
		legacyFirestoreId: null,
		currency: 'EUR',
		rate: new Prisma.Decimal(0.95),
		timestamp: new Date('2025-01-01T00:00:00Z'),
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'exchange-rate-4',
		legacyFirestoreId: null,
		currency: 'SLE',
		rate: new Prisma.Decimal(24.0),
		timestamp: new Date('2025-01-01T00:00:00Z'),
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'exchange-rate-5',
		legacyFirestoreId: null,
		currency: 'LRD',
		rate: new Prisma.Decimal(203.0),
		timestamp: new Date('2025-01-01T00:00:00Z'),
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	}
];