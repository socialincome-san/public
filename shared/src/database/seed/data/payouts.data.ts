import { Payout, PayoutStatus, Prisma } from '@prisma/client';

export const payoutsData: Payout[] = [
	{
		id: 'payout-1',
		legacyFirestoreId: null,
		amount: new Prisma.Decimal(50),
		amountChf: new Prisma.Decimal(25),
		currency: 'SLE',
		paymentAt: new Date('2024-04-01'),
		status: PayoutStatus.paid,
		phoneNumber: '+23276123456',
		comments: 'First payout completed successfully.',
		message: 'Your payout has been received.',
		recipientId: 'recipient-1',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'payout-2',
		legacyFirestoreId: null,
		amount: new Prisma.Decimal(75),
		amountChf: new Prisma.Decimal(37.5),
		currency: 'SLE',
		paymentAt: new Date('2024-05-01'),
		status: PayoutStatus.paid,
		phoneNumber: '+23277111222',
		comments: 'Second payout confirmed.',
		message: 'Funds delivered via Orange Money.',
		recipientId: 'recipient-2',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'payout-3',
		legacyFirestoreId: null,
		amount: new Prisma.Decimal(60),
		amountChf: new Prisma.Decimal(30),
		currency: 'SLE',
		paymentAt: new Date('2024-06-01'),
		status: PayoutStatus.created,
		phoneNumber: '+23288765432',
		comments: 'Pending confirmation from partner.',
		message: 'Your payout is being processed.',
		recipientId: 'recipient-3',
		createdAt: new Date(),
		updatedAt: null
	}
];