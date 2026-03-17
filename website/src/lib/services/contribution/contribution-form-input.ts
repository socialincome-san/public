import { ContributionStatus, Currency } from '@/generated/prisma/enums';
import z from 'zod';

const requiredId = z.string().trim().min(1, 'This field is required.');
const positiveNumber = z.coerce.number().positive('Value must be positive.');

export const contributionCreateInputSchema = z.object({
	amount: positiveNumber,
	currency: z.nativeEnum(Currency),
	amountChf: positiveNumber,
	feesChf: positiveNumber,
	status: z.nativeEnum(ContributionStatus),
	contributorId: requiredId,
	campaignId: requiredId,
});

export const contributionUpdateInputSchema = contributionCreateInputSchema.extend({
	id: requiredId,
});

export type ContributionFormCreateInput = z.infer<typeof contributionCreateInputSchema>;
export type ContributionFormUpdateInput = z.infer<typeof contributionUpdateInputSchema>;
