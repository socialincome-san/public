import { EntityReference } from '@camberi/firecms';

export const ADMIN_USER_FIRESTORE_PATH = 'admins';

export type AdminUser = {
	name: string;
	is_global_admin?: boolean;
	is_global_analyst?: boolean;
	organisations?: EntityReference[];
};
