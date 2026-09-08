import { Currency, Prisma, type Reserve } from '@/generated/prisma/client';

// Reserve snapshots must stay anchored to the current date: the runway calculation compares the latest
// reserves against the payouts of the month before they were recorded. Dates are built in UTC to match
// ReservesCalculationService and to keep the date-only column stable across timezones.
const now = new Date();
const latestSnapshotDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
const previousSnapshotDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

type ReserveSeed = {
	id: Reserve['id'];
	bankAccountId: Reserve['bankAccountId'];
	date: Reserve['date'];
	currency: Currency;
	amount: string;
	amountChf: string;
};

const reserveSeeds: readonly ReserveSeed[] = [
	{
		id: 'reserve-postfinance-1-previous-snapshot',
		bankAccountId: 'bank-account-postfinance-1',
		date: previousSnapshotDate,
		currency: Currency.CHF,
		amount: '1100.00',
		amountChf: '1100.00',
	},
	{
		id: 'reserve-postfinance-2-previous-snapshot',
		bankAccountId: 'bank-account-postfinance-2',
		date: previousSnapshotDate,
		currency: Currency.CHF,
		amount: '900.00',
		amountChf: '900.00',
	},
	{
		id: 'reserve-postfinance-3-previous-snapshot',
		bankAccountId: 'bank-account-postfinance-3',
		date: previousSnapshotDate,
		currency: Currency.CHF,
		amount: '400.00',
		amountChf: '400.00',
	},
	{
		id: 'reserve-custodian-stablecoin-wallet-previous-snapshot',
		bankAccountId: 'bank-account-custodian-stablecoin-wallet',
		date: previousSnapshotDate,
		currency: Currency.USD,
		amount: '212.50',
		amountChf: '250.00',
	},
	{
		id: 'reserve-postfinance-1-latest-snapshot',
		bankAccountId: 'bank-account-postfinance-1',
		date: latestSnapshotDate,
		currency: Currency.CHF,
		amount: '1200.00',
		amountChf: '1200.00',
	},
	{
		id: 'reserve-postfinance-2-latest-snapshot',
		bankAccountId: 'bank-account-postfinance-2',
		date: latestSnapshotDate,
		currency: Currency.CHF,
		amount: '850.00',
		amountChf: '850.00',
	},
	{
		id: 'reserve-postfinance-3-latest-snapshot',
		bankAccountId: 'bank-account-postfinance-3',
		date: latestSnapshotDate,
		currency: Currency.CHF,
		amount: '450.00',
		amountChf: '450.00',
	},
	{
		id: 'reserve-custodian-stablecoin-wallet-latest-snapshot',
		bankAccountId: 'bank-account-custodian-stablecoin-wallet',
		date: latestSnapshotDate,
		currency: Currency.USD,
		amount: '255.00',
		amountChf: '300.00',
	},
];

export const reservesData: Reserve[] = reserveSeeds.map(({ amount, amountChf, ...reserve }) => ({
	...reserve,
	amount: new Prisma.Decimal(amount),
	amountChf: new Prisma.Decimal(amountChf),
	createdAt: reserve.date,
	updatedAt: null,
}));
