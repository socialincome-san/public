/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { CreateUserInput, UpdateUserInput } from '@/modules/users/user.schemas';
import type { UserPayload } from '@/modules/users/user.types';
import { UserFormSchema } from './users-form';

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');
const toStringArray = (value: unknown): string[] =>
	Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];

export const buildCreateUserInput = (schema: UserFormSchema): CreateUserInput => {
	return {
		firstName: asString(schema.fields.firstName.value).trim(),
		lastName: asString(schema.fields.lastName.value).trim(),
		email: asString(schema.fields.email.value).trim(),
		role: schema.fields.role.value,
		organizationIds: toStringArray(schema.fields.organizations.value),
	};
};

export const buildUpdateUserInput = (schema: UserFormSchema, existing: UserPayload): UpdateUserInput => {
	return {
		id: existing.id,
		firstName: asString(schema.fields.firstName.value).trim(),
		lastName: asString(schema.fields.lastName.value).trim(),
		email: asString(schema.fields.email.value).trim(),
		role: schema.fields.role.value,
		organizationIds: toStringArray(schema.fields.organizations.value),
	};
};
