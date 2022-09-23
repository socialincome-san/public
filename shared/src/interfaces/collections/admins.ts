import { EntityReference } from '../entityReference';

export interface AdminUser {
	name: string;
	is_global_admin?: boolean;
	is_global_analyst?: boolean;
	organisations?: EntityReference[];
}

export const path = 'admins';
