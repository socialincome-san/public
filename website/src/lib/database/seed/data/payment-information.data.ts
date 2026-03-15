import { PaymentInformation } from '@/generated/prisma/client';

export const paymentInformationsData: PaymentInformation[] = [
	{
		id: 'payment-information-1',
		mobileMoneyProviderId: 'mobile-money-provider-id-1',
		code: 'OM-SL-001',
		phoneId: 'phone-1',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'payment-information-2',
		mobileMoneyProviderId: 'mobile-money-provider-id-1',
		code: 'OM-SL-002',
		phoneId: 'phone-5',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'payment-information-3',
		mobileMoneyProviderId: 'mobile-money-provider-id-1',
		code: 'OM-SL-003',
		phoneId: 'phone-6',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null,
	},
];