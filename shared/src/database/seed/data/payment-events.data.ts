import { PaymentEventType, Prisma } from '@prisma/client';

export const paymentEventsData: Prisma.PaymentEventCreateManyInput[] = [
	{
		id: 'payment-event-1',
		contributionId: 'contribution-1',
		type: PaymentEventType.stripe,
		transactionId: 'txn-001',
		metadata: { method: 'credit_card', status: 'succeeded' } as Prisma.InputJsonValue,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'payment-event-2',
		contributionId: 'contribution-2',
		type: PaymentEventType.stripe,
		transactionId: 'txn-002',
		metadata: { method: 'apple_pay', status: 'succeeded' } as Prisma.InputJsonValue,
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'payment-event-3',
		contributionId: 'contribution-3',
		type: PaymentEventType.stripe,
		transactionId: 'txn-003',
		metadata: { method: 'bank_transfer', status: 'succeeded' } as Prisma.InputJsonValue,
		createdAt: new Date(),
		updatedAt: null
	}
];