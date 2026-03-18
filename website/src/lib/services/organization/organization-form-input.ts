import z from 'zod';

const requiredTrimmedString = (label: string) => z.string().trim().min(1, `${label} is required.`);

const userIdsSchema = z.array(z.string().trim().min(1)).default([]);

const noPermissionOverlapMessage = 'A user cannot have both edit and readonly permission.';

const organizationBaseInputSchema = z.object({
	name: requiredTrimmedString('Organization name'),
	editUserIds: userIdsSchema,
	readonlyUserIds: userIdsSchema,
	ownedProgramIds: z.array(z.string().trim().min(1)).default([]),
	operatedProgramIds: z.array(z.string().trim().min(1)).default([]),
});

const hasNoPermissionOverlap = (value: { editUserIds: string[]; readonlyUserIds: string[] }) =>
	value.readonlyUserIds.every((readonlyUserId) => !value.editUserIds.includes(readonlyUserId));

export const organizationCreateInputSchema = organizationBaseInputSchema.refine(
	hasNoPermissionOverlap,
	noPermissionOverlapMessage,
);

export const organizationUpdateInputSchema = organizationBaseInputSchema
	.extend({
		id: requiredTrimmedString('Organization id'),
	})
	.refine(hasNoPermissionOverlap, noPermissionOverlapMessage);

export const organizationRenameInputSchema = z.object({
	name: requiredTrimmedString('Organization name'),
});

export type OrganizationFormCreateInput = z.infer<typeof organizationCreateInputSchema>;
export type OrganizationFormUpdateInput = z.infer<typeof organizationUpdateInputSchema>;
export type OrganizationRenameInput = z.infer<typeof organizationRenameInputSchema>;
