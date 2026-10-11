import { organizationCreateSchema, organizationRenameSchema, organizationUpdateSchema } from './organization.schemas';

const validInput = {
	name: 'Organization',
	userIds: [],
	ownedProgramIds: [],
	operatedProgramIds: [],
};

describe('organization schemas', () => {
	test('trims organization names', () => {
		const result = organizationCreateSchema.safeParse({ ...validInput, name: ' Organization ' });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Organization');
		}
	});

	test('requires an id when updating', () => {
		expect(organizationUpdateSchema.safeParse(validInput).success).toBe(false);
		expect(organizationUpdateSchema.safeParse({ ...validInput, id: 'organization-1' }).success).toBe(true);
	});

	test('requires a non-empty name when renaming', () => {
		expect(organizationRenameSchema.safeParse({ name: ' ' }).success).toBe(false);
	});
});
