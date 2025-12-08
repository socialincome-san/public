'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { getZodEnum } from '@/components/dynamic-form/helper';

import { ContributionStatus } from '@prisma/client';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';

import {
	createContributionAction,
	getContributionAction,
	getContributionsOptionsAction,
	updateContributionAction,
} from '@/lib/server-actions/contributions-actions';
import { CampaignOption } from '@/lib/services/campaign/campaign.types';
import { ContributionPayload } from '@/lib/services/contribution/contribution.types';
import { ContributorOption } from '@/lib/services/contributor/contributor.types';
import { buildCreateContributionInput, buildUpdateContributionInput } from './contribution-form-helpers';

type ContributionFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	contributionId?: string;
	readOnly?: boolean;
};

export type ContributionFormSchema = {
	label: string;
	fields: {
		amount: FormField;
		currency: FormField;
		amountChf: FormField;
		feesChf: FormField;
		contributor: FormField;
		status: FormField;
		campaign: FormField;
	};
};

const initialFormSchema: ContributionFormSchema = {
	label: 'Contribution',
	fields: {
		amount: {
			placeholder: 'Contribution Amount',
			label: 'Amount',
			zodSchema: z.number().positive('Amount must be positive'),
		},
		currency: {
			placeholder: 'e.g., USD, EUR, CHF',
			label: 'Currency Code',
			zodSchema: z.string().length(3, 'Currency code must be 3 letters.'),
		},
		amountChf: {
			placeholder: 'Contribution Amount in CHF',
			label: 'Amount CHF',
			zodSchema: z.number().positive('Amount must be positive'),
		},
		feesChf: {
			placeholder: 'Contribution Fees in CHF',
			label: 'Fees CHF',
			zodSchema: z.number().positive('Fees must be positive'),
		},
		contributor: {
			placeholder: 'Select Contributor',
			label: 'Contributor',
			useCombobox: true,
		},
		status: {
			placeholder: 'Contribution Status',
			label: 'Status',
			zodSchema: z.nativeEnum(ContributionStatus),
		},
		campaign: {
			placeholder: 'Select Campaign',
			label: 'Campaign',
		},
	},
};

export function ContributionForm({ onSuccess, onError, onCancel, contributionId, readOnly }: ContributionFormProps) {
	const [formSchema, setFormSchema] = useState(initialFormSchema);
	const [contribution, setContribution] = useState<ContributionPayload>();
	const [optionsLoaded, setOptionsLoaded] = useState(false);
	const [isLoading, startTransition] = useTransition();

	useEffect(() => {
		startTransition(async () => {
			const { contributorOptions, campaignOptions } = await getContributionsOptionsAction();

			if (!contributorOptions.success || !campaignOptions.success) return;

			const contributorEnum = getZodEnum(
				contributorOptions.data.map((c: ContributorOption) => ({
					id: c.id,
					label: c.name,
				})),
			);

			const campaignEnum = getZodEnum(
				campaignOptions.data.map((c: CampaignOption) => ({
					id: c.id,
					label: c.name,
				})),
			);

			setFormSchema((prev) => ({
				...prev,
				fields: {
					...prev.fields,
					contributor: {
						...prev.fields.contributor,
						zodSchema: z.nativeEnum(contributorEnum),
					},
					campaign: {
						...prev.fields.campaign,
						zodSchema: z.nativeEnum(campaignEnum),
					},
				},
			}));

			setOptionsLoaded(true);
		});
	}, []);

	useEffect(() => {
		if (!contributionId || !optionsLoaded) return;

		startTransition(async () => {
			const result = await getContributionAction(contributionId);
			if (!result.success) return onError?.(result.error);

			setContribution(result.data);

			setFormSchema((prev) => ({
				...prev,
				fields: {
					...prev.fields,
					amount: { ...prev.fields.amount, value: result.data.amount },
					currency: { ...prev.fields.currency, value: result.data.currency },
					amountChf: { ...prev.fields.amountChf, value: result.data.amountChf },
					feesChf: { ...prev.fields.feesChf, value: result.data.feesChf },
					status: { ...prev.fields.status, value: result.data.status },
					contributor: { ...prev.fields.contributor, value: result.data.contributor.id },
					campaign: { ...prev.fields.campaign, value: result.data.campaign.id },
				},
			}));
		});
	}, [contributionId, optionsLoaded]);

	const onSubmit = (schema: ContributionFormSchema) => {
		startTransition(async () => {
			try {
				let response;

				if (contributionId && contribution) {
					const data = buildUpdateContributionInput(schema, contribution);
					response = await updateContributionAction(data);
				} else {
					const data = buildCreateContributionInput(schema);
					response = await createContributionAction(data);
				}

				response.success ? onSuccess?.() : onError?.(response.error);
			} catch (e) {
				onError?.(e);
			}
		});
	};

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			mode={readOnly ? 'readonly' : contributionId ? 'edit' : 'add'}
		/>
	);
}
