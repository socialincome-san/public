import { MobileMoneyProvider } from '@/generated/prisma/client';

export const mobileMoneyProvidersData: MobileMoneyProvider[] = [
	{
		id: 'mobile-money-provider-id-1',
		name: 'Orange Money',
		isSupported: true,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null,
	},
		{
		id: 'mobile-money-provider-id-2',
		name: 'Yellow Money',
		isSupported: false,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null,
	},
];
