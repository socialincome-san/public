import { ADMIN_USER_FIRESTORE_PATH, AdminUser } from '@socialincome/shared/src/types/admin-user';
import { PARTNER_ORGANISATION_FIRESTORE_PATH } from '@socialincome/shared/src/types/partner-organisation';
import { buildProperties } from 'firecms';
import { buildAuditedCollection } from './shared';

export const adminsCollection = buildAuditedCollection<AdminUser>({
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
