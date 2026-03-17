'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema, getZodEnum } from '@/components/dynamic-form/helper';

import { ContributionStatus } from '@/generated/prisma/enums';
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
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import { allCurrencies } from '@/lib/types/currency';
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
			placeholder: 'Select currency',
			label: 'Currency Code',
			zodSchema: z.nativeEnum(getZodEnum(allCurrencies.map((c) => ({ id: c, label: c })))),
			useCombobox: true,
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

export const ContributionForm = ({ onSuccess, onError, onCancel, contributionId, readOnly }: ContributionFormProps) => {
	const [formSchema, setFormSchema] = useState(() => cloneFormSchema(initialFormSchema));
	const [contribution, setContribution] = useState<ContributionPayload>();
	const [optionsLoaded, setOptionsLoaded] = useState(false);
	const [isLoading, startTransition] = useTransition();

	useEffect(() => {
		startTransition(async () => {
			const optionsResult = await getContributionsOptionsAction();
			handleServiceResult(optionsResult, {
				onSuccess: (data) => {
					const contributorEnum = getZodEnum(
						data.contributorOptions.map((c: ContributorOption) => ({
							id: c.id,
							label: c.name,
						})),
					);

					const campaignEnum = getZodEnum(
						data.campaignOptions.map((c: CampaignOption) => ({
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
				},
				onError: (error) => onError?.(error),
			});
		});
	}, [onError]);

	useEffect(() => {
		if (!contributionId || !optionsLoaded) {
			return;
		}

		startTransition(async () => {
			const result = await getContributionAction(contributionId);
			handleServiceResult(result, {
				onSuccess: (data) => {
					setContribution(data);

					setFormSchema((prev) => {
						const next = clearFormSchemaValues(prev);

						return {
							...next,
							fields: {
								...next.fields,
								amount: { ...next.fields.amount, value: data.amount },
								currency: { ...next.fields.currency, value: data.currency },
								amountChf: { ...next.fields.amountChf, value: data.amountChf },
								feesChf: { ...next.fields.feesChf, value: data.feesChf },
								status: { ...next.fields.status, value: data.status },
								contributor: { ...next.fields.contributor, value: data.contributor.id },
								campaign: { ...next.fields.campaign, value: data.campaign.id },
							},
						};
					});
				},
				onError: (error) => onError?.(error),
			});
		});
	}, [contributionId, onError, optionsLoaded]);

	const onSubmit = (schema: ContributionFormSchema) => {
		startTransition(async () => {
			if (contributionId && contribution?.id !== contributionId) {
				return onError?.('Contribution is still loading. Please try again.');
			}
			const response =
				contributionId && contribution
					? await updateContributionAction(buildUpdateContributionInput(schema, contribution))
					: await createContributionAction(buildCreateContributionInput(schema));
			handleServiceResult(response, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
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
};
