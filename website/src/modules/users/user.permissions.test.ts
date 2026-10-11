import { UserRole } from '@/generated/prisma/enums';
import { isAdminRole } from './user.permissions';

describe('user permissions', () => {
	test('only treats the admin role as administrative access', () => {
		expect(isAdminRole(UserRole.admin)).toBe(true);
		expect(isAdminRole(UserRole.user)).toBe(false);
	});
});
