/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type CreateContributionInput, type UpdateContributionInput } from '@/modules/contributions/contribution.schemas';
import { type ContributionPayload } from '@/modules/contributions/contribution.types';
import { type ContributionFormSchema } from './contribution-form';

export const buildCreateContributionInput = (schema: ContributionFormSchema): CreateContributionInput => {
	return {
		amount: schema.fields.amount.value,
		currency: schema.fields.currency.value,
		amountChf: schema.fields.amountChf.value,
		feesChf: schema.fields.feesChf.value,
		status: schema.fields.status.value,
		sourceType: schema.fields.sourceType.value,
		contributorId: schema.fields.contributor.value,
		campaignId: schema.fields.campaign.value,
	};
};

export const buildUpdateContributionInput = (
	schema: ContributionFormSchema,
	existing: ContributionPayload,
): UpdateContributionInput => {
	return {
		id: existing.id,
		amount: schema.fields.amount.value ?? existing.amount,
		currency: schema.fields.currency.value ?? existing.currency,
		amountChf: schema.fields.amountChf.value ?? existing.amountChf,
		feesChf: schema.fields.feesChf.value ?? existing.feesChf,
		status: schema.fields.status.value ?? existing.status,
		sourceType: schema.fields.sourceType.value ?? existing.sourceType,
		contributorId: schema.fields.contributor.value ?? existing.contributor.id,
		campaignId: schema.fields.campaign.value ?? existing.campaign.id,
	};
};
