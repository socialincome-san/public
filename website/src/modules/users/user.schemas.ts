import { CountryCode, Gender, UserRole } from '@/generated/prisma/enums';
import { z } from 'zod';

const requiredTrimmedString = (label: string) => z.string().trim().min(1, `${label} is required.`);
const organizationIdsSchema = z.array(z.string().trim().min(1)).default([]);
const atLeastOneOrganizationMessage = 'At least one organization permission is required.';
const hasAtLeastOneOrganization = (input: { organizationIds: string[] }) => input.organizationIds.length > 0;

const userBaseSchema = z.object({
	firstName: requiredTrimmedString('First name'),
	lastName: requiredTrimmedString('Last name'),
	email: z.string().trim().email('Please provide a valid email address.'),
	role: z.nativeEnum(UserRole),
	organizationIds: organizationIdsSchema,
});

export const userCreateSchema = userBaseSchema.refine(hasAtLeastOneOrganization, atLeastOneOrganizationMessage);

export const userUpdateSchema = userBaseSchema
	.extend({
		id: requiredTrimmedString('User id'),
	})
	.refine(hasAtLeastOneOrganization, atLeastOneOrganizationMessage);

export const userSelfUpdateSchema = z.object({
	id: z.string().optional(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().optional(),
	role: z.nativeEnum(UserRole).optional(),
	organizationId: z.string().optional(),
	gender: z.nativeEnum(Gender).nullable().optional(),
	language: z.string().nullable().optional(),
	address: z
		.object({
			street: z.string(),
			number: z.string(),
			city: z.string(),
			zip: z.string(),
			country: z.nativeEnum(CountryCode),
		})
		.nullable()
		.optional(),
});

export const userIdSchema = z.string().trim().min(1, 'User id is required.');

export type CreateUserInput = z.infer<typeof userCreateSchema>;
export type UpdateUserInput = z.infer<typeof userUpdateSchema>;
export type UpdateUserSelfInput = z.infer<typeof userSelfUpdateSchema>;
