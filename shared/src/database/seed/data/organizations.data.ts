import { Organization } from '@prisma/client';

export const organizationsData: Organization[] = [
	{
		id: 'organization-1',
		name: 'Migros',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'organization-2',
		name: 'Coop',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'organization-3',
		name: 'Swiss Red Cross',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'organization-4',
		name: 'Caritas',
		createdAt: new Date(),
		updatedAt: null
	}
];