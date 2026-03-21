/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { UserFormCreateInput, UserFormUpdateInput } from '@/lib/services/user/user-form-input';
import { UserPayload } from '@/lib/services/user/user.types';
import { UserFormSchema } from './users-form';

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');
const toStringArray = (value: unknown): string[] =>
	Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];

export const buildCreateUserInput = (schema: UserFormSchema): UserFormCreateInput => {
	return {
		firstName: asString(schema.fields.firstName.value).trim(),
		lastName: asString(schema.fields.lastName.value).trim(),
		email: asString(schema.fields.email.value).trim(),
		role: schema.fields.role.value,
		organizationIds: toStringArray(schema.fields.organizations.value),
	};
};

export const buildUpdateUserInput = (schema: UserFormSchema, existing: UserPayload): UserFormUpdateInput => {
	return {
		id: existing.id,
		firstName: asString(schema.fields.firstName.value).trim(),
		lastName: asString(schema.fields.lastName.value).trim(),
		email: asString(schema.fields.email.value).trim(),
		role: schema.fields.role.value,
		organizationIds: toStringArray(schema.fields.organizations.value),
	};
};
