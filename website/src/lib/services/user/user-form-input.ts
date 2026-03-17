import { UserRole } from '@/generated/prisma/enums';
import z from 'zod';

const requiredTrimmedString = (label: string) => z.string().trim().min(1, `${label} is required.`);
const organizationIdsSchema = z.array(z.string().trim().min(1)).default([]);
const noPermissionOverlapMessage = 'An organization cannot have both edit and readonly permission.';
const atLeastOneOrganizationMessage = 'At least one organization permission is required.';

const hasNoPermissionOverlap = (input: { editOrganizationIds: string[]; readonlyOrganizationIds: string[] }) =>
	input.readonlyOrganizationIds.every((organizationId) => !input.editOrganizationIds.includes(organizationId));

const hasAtLeastOneOrganization = (input: { editOrganizationIds: string[]; readonlyOrganizationIds: string[] }) =>
	input.editOrganizationIds.length > 0 || input.readonlyOrganizationIds.length > 0;

const userBaseInputSchema = z.object({
	firstName: requiredTrimmedString('First name'),
	lastName: requiredTrimmedString('Last name'),
	email: z.string().trim().email('Please provide a valid email address.'),
	role: z.nativeEnum(UserRole),
	editOrganizationIds: organizationIdsSchema,
	readonlyOrganizationIds: organizationIdsSchema,
});

export const userCreateInputSchema = userBaseInputSchema
	.refine(hasNoPermissionOverlap, noPermissionOverlapMessage)
	.refine(hasAtLeastOneOrganization, atLeastOneOrganizationMessage);

export const userUpdateInputSchema = userBaseInputSchema
	.extend({
		id: requiredTrimmedString('User id'),
	})
	.refine(hasNoPermissionOverlap, noPermissionOverlapMessage)
	.refine(hasAtLeastOneOrganization, atLeastOneOrganizationMessage);

export type UserFormCreateInput = z.infer<typeof userCreateInputSchema>;
export type UserFormUpdateInput = z.infer<typeof userUpdateInputSchema>;
