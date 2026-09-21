import { UserRole } from '@/generated/prisma/enums';

export const isAdminRole = (role: UserRole): boolean => role === UserRole.admin;
