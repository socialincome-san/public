import { UserRole } from '@/generated/prisma/enums';
import z from 'zod';

const requiredTrimmedString = (label: string) => z.string().trim().min(1, `${label} is required.`);
const organizationIdsSchema = z.array(z.string().trim().min(1)).default([]);
const atLeastOneOrganizationMessage = 'At least one organization permission is required.';
const hasAtLeastOneOrganization = (input: { organizationIds: string[] }) => input.organizationIds.length > 0;

const userBaseInputSchema = z.object({
	firstName: requiredTrimmedString('First name'),
	lastName: requiredTrimmedString('Last name'),
	email: z.string().trim().email('Please provide a valid email address.'),
	role: z.nativeEnum(UserRole),
	organizationIds: organizationIdsSchema,
});

export const userCreateInputSchema = userBaseInputSchema.refine(hasAtLeastOneOrganization, atLeastOneOrganizationMessage);

export const userUpdateInputSchema = userBaseInputSchema
	.extend({
		id: requiredTrimmedString('User id'),
	})
	.refine(hasAtLeastOneOrganization, atLeastOneOrganizationMessage);

export type UserFormCreateInput = z.infer<typeof userCreateInputSchema>;
export type UserFormUpdateInput = z.infer<typeof userUpdateInputSchema>;
