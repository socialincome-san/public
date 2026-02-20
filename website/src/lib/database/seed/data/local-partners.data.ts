import { LocalPartner } from '@/generated/prisma/client';

export const localPartnersData: LocalPartner[] = [
	{
		id: 'local-partner-1',
		legacyFirestoreId: null,
		name: 'Makeni Development Initiative',
		causes: ['poverty'],
		contactId: 'contact-13',
		accountId: 'account-10',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'local-partner-2',
		legacyFirestoreId: null,
		name: 'Bo Women Empowerment Group',
		causes: ['health'],
		contactId: 'contact-14',
		accountId: 'account-11',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	},
	{
		id: 'local-partner-3',
		legacyFirestoreId: null,
		name: 'Kenema Youth Foundation',
		causes: ['gender_based_violence'],
		contactId: 'contact-15',
		accountId: 'account-12',
		createdAt: new Date('2024-03-12T12:00:00.000Z'),
		updatedAt: null
	}
];