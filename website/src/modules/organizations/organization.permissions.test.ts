import { UserRole } from '@/generated/prisma/enums';
import { canRenameOrganization } from './organization.permissions';

describe('organization permissions', () => {
	test('allows admins and program operators to rename organizations', () => {
		expect(canRenameOrganization(UserRole.admin, false)).toBe(true);
		expect(canRenameOrganization(UserRole.user, true)).toBe(true);
		expect(canRenameOrganization(UserRole.user, false)).toBe(false);
	});
});
