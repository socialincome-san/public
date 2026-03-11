import { UserFormCreateInput, UserFormUpdateInput } from '@/lib/services/user/user-form-input';
import { UserPayload } from '@/lib/services/user/user.types';
import { UserFormSchema } from './users-form';

export const buildCreateUserInput = (schema: UserFormSchema): UserFormCreateInput => {
	return {
		firstName: `${schema.fields.firstName.value ?? ''}`.trim(),
		lastName: `${schema.fields.lastName.value ?? ''}`.trim(),
		email: `${schema.fields.email.value ?? ''}`.trim(),
		role: schema.fields.role.value,
		organizationId: `${schema.fields.organizationId.value ?? ''}`.trim(),
	};
};

export const buildUpdateUserInput = (schema: UserFormSchema, existing: UserPayload): UserFormUpdateInput => {
	return {
		id: existing.id,
		firstName: `${schema.fields.firstName.value ?? ''}`.trim(),
		lastName: `${schema.fields.lastName.value ?? ''}`.trim(),
		email: `${schema.fields.email.value ?? ''}`.trim(),
		role: schema.fields.role.value,
		organizationId: `${schema.fields.organizationId.value ?? ''}`.trim(),
	};
};
