import { Organization } from '@/generated/prisma/client';

export const organizationsData: Organization[] = [
	{
		id: 'org-si-sl',
		name: 'Social Income SL',
		isOperatorFallback: true,
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'org-si-gh',
		name: 'Social Income GH',
		isOperatorFallback: false,
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'org-si-lr',
		name: 'Social Income LR',
		isOperatorFallback: false,
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'org-somaha',
		name: 'Somaha Foundation',
		isOperatorFallback: false,
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
];
