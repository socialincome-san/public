import { OrganizationPermission } from '@prisma/client';

export type OrganizationAccessEntry = {
	organizationId: string;
	permissions: OrganizationPermission[];
};
