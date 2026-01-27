import { Organization } from '@prisma/client';

export const organizationsData: Organization[] = [
	{
		id: 'organization-1',
		name: 'Migros',
		isOperatorFallback: true,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'organization-2',
		name: 'Coop',
		isOperatorFallback: false,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'organization-3',
		name: 'Swiss Red Cross',
		isOperatorFallback: false,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'organization-4',
		name: 'Caritas',
		isOperatorFallback: false,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'organization-5',
		name: 'Famigros',
		isOperatorFallback: false,
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	}
];