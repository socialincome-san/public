import { EntityReference } from '@camberi/firecms';
import { Organisation } from '../organisations/interface';

export interface AdminUser {
	name: string;
	is_global_admin?: boolean;
	is_global_analyst?: boolean;
	organisations?: EntityReference[];
}
