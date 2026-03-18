import z from 'zod';

const requiredTrimmedString = (label: string) => z.string().trim().min(1, `${label} is required.`);

const userIdsSchema = z.array(z.string().trim().min(1)).default([]);

const organizationBaseInputSchema = z.object({
	name: requiredTrimmedString('Organization name'),
	userIds: userIdsSchema,
	ownedProgramIds: z.array(z.string().trim().min(1)).default([]),
	operatedProgramIds: z.array(z.string().trim().min(1)).default([]),
});
export const organizationCreateInputSchema = organizationBaseInputSchema;

export const organizationUpdateInputSchema = organizationBaseInputSchema
	.extend({
		id: requiredTrimmedString('Organization id'),
	});

export const organizationRenameInputSchema = z.object({
	name: requiredTrimmedString('Organization name'),
});

export type OrganizationFormCreateInput = z.infer<typeof organizationCreateInputSchema>;
export type OrganizationFormUpdateInput = z.infer<typeof organizationUpdateInputSchema>;
export type OrganizationRenameInput = z.infer<typeof organizationRenameInputSchema>;
