import { LocalPartner } from '@prisma/client';

export const localPartnersData: LocalPartner[] = [
	{
		id: 'local-partner-1',
		legacyFirestoreId: null,
		name: 'Makeni Development Initiative',
		causes: ['proverty'],
		contactId: 'contact-13',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'local-partner-2',
		legacyFirestoreId: null,
		name: 'Bo Women Empowerment Group',
		causes: ['health'],
		contactId: 'contact-14',
		createdAt: new Date(),
		updatedAt: null
	},
	{
		id: 'local-partner-3',
		legacyFirestoreId: null,
		name: 'Kenema Youth Foundation',
		causes: ['gender_based_violence'],
		contactId: 'contact-15',
		createdAt: new Date(),
		updatedAt: null
	}
];