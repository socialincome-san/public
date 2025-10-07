import { Prisma, Program } from '@prisma/client';

export const programsData: Program[] = [
	{
		id: 'program-1',
		name: 'Migros Poverty Relief – Sierra Leone',
		totalPayments: 12,
		payoutAmount: new Prisma.Decimal(50),
		payoutCurrency: 'SLL',
		payoutInterval: 30,
		country: 'Sierra Leone',
		ownerOrganizationId: 'organization-1',
		operatorOrganizationId: 'organization-3',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'program-2',
		name: 'Coop Cash Assistance – Sierra Leone',
		totalPayments: 6,
		payoutAmount: new Prisma.Decimal(75),
		payoutCurrency: 'SLL',
		payoutInterval: 30,
		country: 'Sierra Leone',
		ownerOrganizationId: 'organization-2',
		operatorOrganizationId: 'organization-3',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'program-3',
		name: 'Swiss Red Cross Basic Needs Support',
		totalPayments: 9,
		payoutAmount: new Prisma.Decimal(60),
		payoutCurrency: 'SLL',
		payoutInterval: 30,
		country: 'Sierra Leone',
		ownerOrganizationId: 'organization-3',
		operatorOrganizationId: 'organization-3',
		createdAt: new Date(),
		updatedAt: null
	}
];