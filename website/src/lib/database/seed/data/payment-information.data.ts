import { PaymentInformation, PaymentProvider } from '@prisma/client';

export const paymentInformationsData: PaymentInformation[] = [
	{
		id: 'payment-information-1',
		provider: PaymentProvider.orange_money,
		code: 'OM-SL-001',
		phoneId: 'phone-1',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'payment-information-2',
		provider: PaymentProvider.orange_money,
		code: 'OM-SL-002',
		phoneId: 'phone-5',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'payment-information-3',
		provider: PaymentProvider.orange_money,
		code: 'OM-SL-003',
		phoneId: 'phone-6',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	}
];