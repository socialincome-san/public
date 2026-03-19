import { LocalPartner } from '@/generated/prisma/client';

export const localPartnersData: LocalPartner[] = [
	{
		id: 'local-partner-sl-1',
		legacyFirestoreId: null,
		name: 'Local Partner SL Operations',
		causes: ['poverty', 'health'],
		contactId: 'ct-localpartner-sl-1',
		accountId: 'acc-localpartner-sl-1',
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'local-partner-gh-1',
		legacyFirestoreId: null,
		name: 'Local Partner GH Operations',
		causes: ['poverty', 'climate'],
		contactId: 'ct-localpartner-gh-1',
		accountId: 'acc-localpartner-gh-1',
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'local-partner-lr-1',
		legacyFirestoreId: null,
		name: 'Local Partner LR Operations',
		causes: ['poverty', 'gender_based_violence'],
		contactId: 'ct-localpartner-lr-1',
		accountId: 'acc-localpartner-lr-1',
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
	{
		id: 'local-partner-somaha-1',
		legacyFirestoreId: null,
		name: 'Local Partner Somaha Operations',
		causes: ['health'],
		contactId: 'ct-localpartner-somaha-1',
		accountId: 'acc-localpartner-somaha-1',
		createdAt: new Date('2025-01-01T13:00:00.000Z'),
		updatedAt: null,
	},
];
