/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {
	ContributionFormCreateInput,
	ContributionFormUpdateInput,
} from '@/lib/services/contribution/contribution-form-input';
import { ContributionPayload } from '@/lib/services/contribution/contribution.types';
import { ContributionFormSchema } from './contribution-form';

export const buildCreateContributionInput = (schema: ContributionFormSchema): ContributionFormCreateInput => {
	return {
		amount: schema.fields.amount.value,
		currency: schema.fields.currency.value,
		amountChf: schema.fields.amountChf.value,
		feesChf: schema.fields.feesChf.value,
		status: schema.fields.status.value,
		contributorId: schema.fields.contributor.value,
		campaignId: schema.fields.campaign.value,
	};
};

export const buildUpdateContributionInput = (
	schema: ContributionFormSchema,
	existing: ContributionPayload,
): ContributionFormUpdateInput => {
	return {
		id: existing.id,
		amount: schema.fields.amount.value ?? existing.amount,
		currency: schema.fields.currency.value ?? existing.currency,
		amountChf: schema.fields.amountChf.value ?? existing.amountChf,
		feesChf: schema.fields.feesChf.value ?? existing.feesChf,
		status: schema.fields.status.value ?? existing.status,
		contributorId: schema.fields.contributor.value ?? existing.contributor.id,
		campaignId: schema.fields.campaign.value ?? existing.campaign.id,
	};
};
