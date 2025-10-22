import { Prisma, Program } from '@prisma/client';

export const programsData: Program[] = [
	{
		id: 'program-1',
		name: 'Migros Relief SL',
		totalPayments: 12,
		payoutAmount: new Prisma.Decimal(50),
		payoutCurrency: 'SLE',
		payoutInterval: 30,
		country: 'Sierra Leone',
		ownerOrganizationId: 'organization-1',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'program-2',
		name: 'Migros Education SL',
		totalPayments: 8,
		payoutAmount: new Prisma.Decimal(40),
		payoutCurrency: 'SLE',
		payoutInterval: 30,
		country: 'Sierra Leone',
		ownerOrganizationId: 'organization-1',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'program-3',
		name: 'Coop Cash Aid SL',
		totalPayments: 6,
		payoutAmount: new Prisma.Decimal(75),
		payoutCurrency: 'SLE',
		payoutInterval: 30,
		country: 'Sierra Leone',
		ownerOrganizationId: 'organization-2',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'program-4',
		name: 'Red Cross Basic Needs',
		totalPayments: 9,
		payoutAmount: new Prisma.Decimal(60),
		payoutCurrency: 'SLE',
		payoutInterval: 30,
		country: 'Sierra Leone',
		ownerOrganizationId: 'organization-3',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'program-5',
		name: 'Caritas Family Support',
		totalPayments: 10,
		payoutAmount: new Prisma.Decimal(80),
		payoutCurrency: 'LRD',
		payoutInterval: 30,
		country: 'Liberia',
		ownerOrganizationId: 'organization-4',
		createdAt: new Date(),
		updatedAt: null
	}
];