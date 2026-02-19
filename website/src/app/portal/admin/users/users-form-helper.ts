import { UserCreateInput, UserPayload, UserUpdateInput } from '@/lib/services/user/user.types';
import { UserFormSchema } from './users-form';

export const buildCreateUserInput = (schema: UserFormSchema): UserCreateInput => {
	return {
		firstName: schema.fields.firstName.value,
		lastName: schema.fields.lastName.value,
		email: schema.fields.email.value,
		role: schema.fields.role.value,
		organizationId: schema.fields.organizationId.value,
	};
};

export const buildUpdateUserInput = (schema: UserFormSchema, existing: UserPayload): UserUpdateInput => {
	return {
		id: existing.id,
		firstName: schema.fields.firstName.value,
		lastName: schema.fields.lastName.value,
		email: schema.fields.email.value,
		role: schema.fields.role.value,
		organizationId: schema.fields.organizationId.value,
	};
};
