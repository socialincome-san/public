import {
	ContributionCreateInput,
	ContributionPayload,
	ContributionUpdateInput,
} from '@/lib/services/contribution/contribution.types';
import { ContributionFormSchema } from './contribution-form';

export const buildCreateContributionInput = (schema: ContributionFormSchema): ContributionCreateInput => {
	return {
		amount: schema.fields.amount.value,
		currency: schema.fields.currency.value,
		amountChf: schema.fields.amountChf.value,
		feesChf: schema.fields.feesChf.value,
		status: schema.fields.status.value,
		contributor: {
			connect: { id: schema.fields.contributor.value },
		},
		campaign: {
			connect: { id: schema.fields.campaign.value },
		},
	};
}

export const buildUpdateContributionInput = (
	schema: ContributionFormSchema,
	existing: ContributionPayload,
): ContributionUpdateInput => {
	const data: ContributionUpdateInput = {
		id: existing.id,
		amount: schema.fields.amount.value ?? existing.amount,
		currency: schema.fields.currency.value ?? existing.currency,
		amountChf: schema.fields.amountChf.value ?? existing.amountChf,
		feesChf: schema.fields.feesChf.value ?? existing.feesChf,
		status: schema.fields.status.value ?? existing.status,
	};

	if (schema.fields.contributor.value && schema.fields.contributor.value !== existing.contributor.id) {
		data.contributor = { connect: { id: schema.fields.contributor.value } };
	}

	if (schema.fields.campaign.value && schema.fields.campaign.value !== existing.campaign.id) {
		data.campaign = { connect: { id: schema.fields.campaign.value } };
	}

	return data;
}
