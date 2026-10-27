import { Organization } from '@/generated/prisma/client';
import { CountryCode } from '@/generated/prisma/enums';

export const organizationsData: Organization[] = [
	{
		id: 'org-si-sl',
		name: 'Social Income SL',
		operatorFallbackCountryCode: CountryCode.SL,
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'org-si-gh',
		name: 'Social Income GH',
		operatorFallbackCountryCode: null,
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'org-si-lr',
		name: 'Social Income LR',
		operatorFallbackCountryCode: null,
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'org-somaha',
		name: 'Somaha Foundation',
		operatorFallbackCountryCode: null,
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
];
