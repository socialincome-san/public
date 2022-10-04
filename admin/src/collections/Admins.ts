import { buildCollection, buildProperties } from '@camberi/firecms';
import { AdminUser, ADMIN_USER_FIRESTORE_PATH, PARTNER_ORGANISATION_FIRESTORE_PATH } from '@socialincome/shared/types';

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
