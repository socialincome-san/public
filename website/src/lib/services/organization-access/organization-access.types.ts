import { OrganizationPermission } from '@/generated/prisma/client';

export type ActiveOrganizationAccess = {
  id: string;
  permission: OrganizationPermission;
};
