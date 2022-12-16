import { buildCollection, buildProperties } from '@camberi/firecms';
import { AdminUser, ADMIN_USER_FIRESTORE_PATH, PARTNER_ORGANISATION_FIRESTORE_PATH } from '../../../shared/src/types';

export const adminsCollection = buildCollection<AdminUser>({
	name: 'Admins',
	group: 'Admin',
	path: ADMIN_USER_FIRESTORE_PATH,
	icon: 'SupervisorAccountTwoTone',
	description: 'Lists all admins for this admin panel',
	customId: true,
	properties: buildProperties<AdminUser>({
		is_global_admin: {
			dataType: 'boolean',
			name: 'Global Admin',
		},
		is_global_analyst: {
			dataType: 'boolean',
			name: 'Global Analyst',
		},
		name: {
			dataType: 'string',
			name: 'Full Name',
		},
		organisations: {
			dataType: 'array',
			of: {
				dataType: 'reference',
				path: PARTNER_ORGANISATION_FIRESTORE_PATH,
			},
		},
	}),
});
