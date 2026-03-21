import { Currency, Payout, PayoutStatus, Prisma } from '@/generated/prisma/client';
import { recipientsData } from './recipients.data';

const createdAt = new Date('2025-01-01T13:00:00.000Z');

type RecipientId = (typeof recipientsData)[number]['id'];
type PayoutSeed = {
	id: Payout['id'];
	recipientId: RecipientId;
	currency: Currency;
	amount: Prisma.Decimal;
	amountChf: Prisma.Decimal;
	paymentAt: Payout['paymentAt'];
	phoneNumber: NonNullable<Payout['phoneNumber']>;
};

const payoutSeeds: readonly PayoutSeed[] = [
	{
		id: 'payout-core-sl-active',
		recipientId: 'recipient-core-sl-active',
		currency: Currency.SLE,
		amount: new Prisma.Decimal(600),
		amountChf: new Prisma.Decimal('2.10'),
		paymentAt: new Date('2024-12-01T00:00:00.000Z'),
		phoneNumber: '+23231000001',
	},
	{
		id: 'payout-women-sl-active',
		recipientId: 'recipient-women-sl-active',
		currency: Currency.SLE,
		amount: new Prisma.Decimal(580),
		amountChf: new Prisma.Decimal('2.03'),
		paymentAt: new Date('2024-12-01T00:00:00.000Z'),
		phoneNumber: '+23231000005',
	},
	{
		id: 'payout-education-sl-active',
		recipientId: 'recipient-education-sl-active',
		currency: Currency.SLE,
		amount: new Prisma.Decimal(560),
		amountChf: new Prisma.Decimal('1.96'),
		paymentAt: new Date('2024-12-01T00:00:00.000Z'),
		phoneNumber: '+23231000009',
	},
	{
		id: 'payout-livelihood-gh-active',
		recipientId: 'recipient-livelihood-gh-active',
		currency: Currency.GHS,
		amount: new Prisma.Decimal(950),
		amountChf: new Prisma.Decimal('70.00'),
		paymentAt: new Date('2024-12-01T00:00:00.000Z'),
		phoneNumber: '+23324100001',
	},
	{
		id: 'payout-education-gh-active',
		recipientId: 'recipient-education-gh-active',
		currency: Currency.GHS,
		amount: new Prisma.Decimal(900),
		amountChf: new Prisma.Decimal('66.00'),
		paymentAt: new Date('2024-12-01T00:00:00.000Z'),
		phoneNumber: '+23324100005',
	},
	{
		id: 'payout-resilience-lr-active',
		recipientId: 'recipient-resilience-lr-active',
		currency: Currency.LRD,
		amount: new Prisma.Decimal(6400),
		amountChf: new Prisma.Decimal('30.50'),
		paymentAt: new Date('2024-12-01T00:00:00.000Z'),
		phoneNumber: '+23177100001',
	},
	{
		id: 'payout-health-lr-active',
		recipientId: 'recipient-health-lr-active',
		currency: Currency.LRD,
		amount: new Prisma.Decimal(6200),
		amountChf: new Prisma.Decimal('29.80'),
		paymentAt: new Date('2024-12-01T00:00:00.000Z'),
		phoneNumber: '+23177100005',
	},
	{
		id: 'payout-somaha-lr-active',
		recipientId: 'recipient-somaha-lr-active',
		currency: Currency.LRD,
		amount: new Prisma.Decimal(6500),
		amountChf: new Prisma.Decimal('31.00'),
		paymentAt: new Date('2024-12-01T00:00:00.000Z'),
		phoneNumber: '+23177100009',
	},
];

export const payoutsData: Payout[] = payoutSeeds.map(
	({ id, recipientId, currency, amount, amountChf, paymentAt, phoneNumber }) => ({
		id,
		legacyFirestoreId: null,
		amount,
		amountChf,
		currency,
		paymentAt,
		status: PayoutStatus.paid,
		phoneNumber,
		comments: `seed_payout_${recipientId}`,
		recipientId,
		createdAt,
		updatedAt: null,
	}),
);
