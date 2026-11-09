import { ContributionSourceType, ContributionStatus, Currency } from '@/generated/prisma/enums';
import { tableQueryFilterSchema, tableQuerySchema } from '@/lib/table-query-schema';
import { z } from 'zod';

const requiredId = z.string().trim().min(1, 'This field is required.');
const positiveNumber = z.coerce.number().positive('Value must be positive.');

export const contributionCreateSchema = z.object({
	amount: positiveNumber,
	currency: z.nativeEnum(Currency),
	amountChf: positiveNumber,
	feesChf: positiveNumber,
	status: z.nativeEnum(ContributionStatus),
	sourceType: z.nativeEnum(ContributionSourceType),
	contributorId: requiredId,
	campaignId: requiredId,
});

export const contributionTableQuerySchema = tableQuerySchema.extend({
	programId: tableQueryFilterSchema,
	campaignId: tableQueryFilterSchema,
	paymentEventType: tableQueryFilterSchema,
	contributorId: tableQueryFilterSchema,
});

export const contributionUpdateSchema = contributionCreateSchema.extend({
	id: requiredId,
});

export const contributionIdSchema = z.string().trim().min(1, 'Contribution id is required.');

export const contributionGlobeDaysSchema = z.number().int().min(1).max(365);

export type CreateContributionInput = z.infer<typeof contributionCreateSchema>;
export type UpdateContributionInput = z.infer<typeof contributionUpdateSchema>;
