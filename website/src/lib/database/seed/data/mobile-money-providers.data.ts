import { MobileMoneyProvider } from '@/generated/prisma/client';

export const mobileMoneyProvidersData: MobileMoneyProvider[] = [
	{
		id: 'mobile-money-provider-id-1',
		name: 'Orange Money',
		isSupported: false,
		parentId: null,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'mobile-money-provider-id-2',
		name: 'Yellow Money',
		isSupported: false,
		parentId: null,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'mobile-money-provider-id-3',
		name: 'Orange Money SL 🇸🇱',
		isSupported: true,
		parentId: 'mobile-money-provider-id-1',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'mobile-money-provider-id-4',
		name: 'Orange Money LR 🇱🇷',
		isSupported: true,
		parentId: 'mobile-money-provider-id-1',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null,
	},
];
