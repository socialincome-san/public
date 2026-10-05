import { z } from 'zod';

const requiredTrimmedString = (label: string) => z.string().trim().min(1, `${label} is required.`);
const idsSchema = z.array(z.string().trim().min(1)).default([]);

const organizationBaseSchema = z.object({
	name: requiredTrimmedString('Organization name'),
	userIds: idsSchema,
	ownedProgramIds: idsSchema,
	operatedProgramIds: idsSchema,
});

export const organizationCreateSchema = organizationBaseSchema;

export const organizationUpdateSchema = organizationBaseSchema.extend({
	id: requiredTrimmedString('Organization id'),
});

export const organizationRenameSchema = z.object({
	name: requiredTrimmedString('Organization name'),
});

export const organizationIdSchema = requiredTrimmedString('Organization id');

export type CreateOrganizationInput = z.infer<typeof organizationCreateSchema>;
export type UpdateOrganizationInput = z.infer<typeof organizationUpdateSchema>;
export type RenameOrganizationInput = z.infer<typeof organizationRenameSchema>;
