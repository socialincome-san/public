import { UserRole } from '@/generated/prisma/enums';
import { userCreateSchema, userSelfUpdateSchema, userUpdateSchema } from './user.schemas';

const validUserInput = {
	firstName: 'Ada',
	lastName: 'Lovelace',
	email: 'ada@example.org',
	role: UserRole.user,
	organizationIds: ['organization-1'],
};

describe('user schemas', () => {
	test('trims valid create input', () => {
		const result = userCreateSchema.safeParse({
			...validUserInput,
			firstName: ' Ada ',
			email: ' ada@example.org ',
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.firstName).toBe('Ada');
			expect(result.data.email).toBe('ada@example.org');
		}
	});

	test('requires organization access for managed users', () => {
		expect(userCreateSchema.safeParse({ ...validUserInput, organizationIds: [] }).success).toBe(false);
		expect(userUpdateSchema.safeParse({ ...validUserInput, id: 'user-1', organizationIds: [] }).success).toBe(false);
	});

	test('accepts partial self updates', () => {
		expect(userSelfUpdateSchema.safeParse({ firstName: 'Grace' }).success).toBe(true);
		expect(userSelfUpdateSchema.safeParse({}).success).toBe(true);
	});
});
