import { ExchangeRate, Prisma } from '@/generated/prisma/client';

const latestExchangeRatesData: ExchangeRate[] = [
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

export const exchangeRatesData: ExchangeRate[] = [...latestExchangeRatesData];

const historicalRateByCurrency = [
	{ currency: 'CHF' as const, rate: 1 },
	{ currency: 'USD' as const, rate: 0.85 },
	{ currency: 'EUR' as const, rate: 0.95 },
	{ currency: 'SLE' as const, rate: 24 },
	{ currency: 'LRD' as const, rate: 203 },
];

for (let i = 0; i < 3000; i += 1) {
	const timestamp = new Date('2024-12-01T00:00:00Z');
	timestamp.setUTCMinutes(timestamp.getUTCMinutes() + i);
	const { currency, rate } = historicalRateByCurrency[i % historicalRateByCurrency.length];
	const variation = ((i % 17) - 8) / 1000; // deterministic range: -0.008 .. +0.008
	const variedRate = rate * (1 + variation);

	exchangeRatesData.push({
		id: `exchange-rate-historical-${i + 1}`,
		legacyFirestoreId: null,
		currency,
		rate: new Prisma.Decimal(variedRate),
		timestamp,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null,
	});
}