'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema, getZodEnum } from '@/components/dynamic-form/helper';

import { ContributionStatus } from '@/generated/prisma/enums';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';

import { handleResult } from '@/lib/result-client';
import { allCurrencies } from '@/lib/types/currency';
import { CampaignOption } from '@/modules/campaigns/campaign.types';
import {
	createContributionAction,
	getContributionAction,
	getContributionsOptionsAction,
	updateContributionAction,
} from '@/modules/contributions/contribution.actions';
import { ContributionPayload } from '@/modules/contributions/contribution.types';
import { ContributorOption } from '@/modules/contributors/contributor.types';
import { useTranslations } from 'next-intl';
import { buildCreateContributionInput, buildUpdateContributionInput } from './contribution-form-helpers';

type ContributionFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	contributionId?: string;
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

const createInitialFormSchema = (t: ReturnType<typeof useTranslations<'portal-management'>>): ContributionFormSchema => ({
	label: t('forms.contribution.section'),
	fields: {
		amount: {
			placeholder: t('forms.contribution.amountPlaceholder'),
			label: t('forms.contribution.amount'),
			zodSchema: z.number().positive(t('validation.amountPositive')),
		},
		currency: {
			placeholder: t('forms.contribution.selectCurrency'),
			label: t('forms.contribution.currency'),
			zodSchema: z.nativeEnum(getZodEnum(allCurrencies.map((c) => ({ id: c, label: c })))),
			useCombobox: true,
		},
		amountChf: {
			placeholder: t('forms.contribution.amountChfPlaceholder'),
			label: t('forms.contribution.amountChf'),
			zodSchema: z.number().positive(t('validation.amountPositive')),
		},
		feesChf: {
			placeholder: t('forms.contribution.feesChfPlaceholder'),
			label: t('forms.contribution.feesChf'),
			zodSchema: z.number().positive(t('validation.feesPositive')),
		},
		contributor: {
			placeholder: t('forms.contribution.selectContributor'),
			label: t('forms.contribution.contributor'),
			useCombobox: true,
		},
		status: {
			placeholder: t('forms.contribution.statusPlaceholder'),
			label: t('forms.contribution.status'),
			zodSchema: z.nativeEnum(ContributionStatus),
		},
		campaign: {
			placeholder: t('forms.contribution.selectCampaign'),
			label: t('forms.contribution.campaign'),
		},
	},
});

export const ContributionForm = ({ onSuccess, onError, onCancel, contributionId }: ContributionFormProps) => {
	const t = useTranslations('portal-management');
	const [formSchema, setFormSchema] = useState(() => cloneFormSchema(createInitialFormSchema(t)));
	const [contribution, setContribution] = useState<ContributionPayload>();
	const [optionsLoaded, setOptionsLoaded] = useState(false);
	const [isLoading, startTransition] = useTransition();

	useEffect(() => {
		startTransition(async () => {
			const optionsResult = await getContributionsOptionsAction();
			handleResult(optionsResult, {
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
			handleResult(result, {
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
				return onError?.(t('validation.contributionLoading'));
			}
			const response =
				contributionId && contribution
					? await updateContributionAction(buildUpdateContributionInput(schema, contribution))
					: await createContributionAction(buildCreateContributionInput(schema));
			handleResult(response, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	const mode: 'edit' | 'add' = contributionId ? 'edit' : 'add';

	return <DynamicForm formSchema={formSchema} isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} mode={mode} />;
};
