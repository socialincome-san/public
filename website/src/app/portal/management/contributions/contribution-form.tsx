'use client';

import DynamicForm, { FormField } from '@/components/legacy/dynamic-form/dynamic-form';
import { getZodEnum } from '@/components/legacy/dynamic-form/helper';
import {
	getContributionAction,
	getContributionsOptionsAction,
	updateContributionAction,
} from '@/lib/server-actions/contributions-actions';
import { CampaignOption } from '@/lib/services/campaign/campaign.types';
import { ContributionUpdateInput } from '@/lib/services/contribution/contribution.types';
import { ContributorOption } from '@/lib/services/contributor/contributor.types';
import { ContributionStatus } from '@prisma/client';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';

export type ContributionFormSchema = {
	label: string;
	fields: {
		amount: FormField;
		currency: FormField;
		amountChf: FormField;
		feesChf: FormField;
		contributor: FormField;
		status: FormField;
		campgaign: FormField;
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
		campgaign: {
			placeholder: 'Select Campaign',
			label: 'Campaign',
		},
	},
};

export default function ContributionsForm({
	onSuccess,
	onError,
	onCancel,
	contributionId,
	readOnly,
}: {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	contributionId?: string;
	readOnly: boolean;
}) {
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(initialFormSchema);
	const [isLoading, startTransition] = useTransition();

	useEffect(() => {
		if (contributionId) {
			// Load contribution
			startTransition(async () => await loadContribution(contributionId));
		}
	}, [contributionId]);

	useEffect(() => {
		// load options for campaigns and contributors
		startTransition(async () => {
			const { campaignOptions, contributorOptions } = await getContributionsOptionsAction();
			if (!campaignOptions.success || !contributorOptions.success) return;
			setOptions(campaignOptions.data, contributorOptions.data);
		});
	}, []);

	const loadContribution = async (id: string) => {
		startTransition(async () => {
			if (contributionId) {
				try {
					const result = await getContributionAction(contributionId);
					if (result.success) {
						const newSchema = { ...formSchema };
						newSchema.fields.amount.value = result.data.amount;
						newSchema.fields.currency.value = result.data.currency;
						newSchema.fields.amountChf.value = result.data.amountChf;
						newSchema.fields.feesChf.value = result.data.feesChf;
						newSchema.fields.contributor.value = result.data.contributor.id;
						newSchema.fields.status.value = result.data.status;
						newSchema.fields.campgaign.value = result.data.campaign.id;
						setFormSchema(newSchema);
					} else {
						onError?.(result.error);
					}
				} catch (error: unknown) {
					onError?.(error);
				}
			}
		});
	};

	const setOptions = (campaignOptions: CampaignOption[], contributorOptions: ContributorOption[]) => {
		const optionsToZodEnum = (options: CampaignOption[] | ContributorOption[]) =>
			getZodEnum(options.map(({ id, name }) => ({ id, label: name })));

		const campaignsObj = optionsToZodEnum(campaignOptions);
		const contributorsObj = optionsToZodEnum(contributorOptions);

		setFormSchema((prevSchema) => ({
			...prevSchema,
			fields: {
				...prevSchema.fields,
				campgaign: {
					...prevSchema.fields.campgaign,
					zodSchema: z.nativeEnum(campaignsObj),
				},
				contributor: {
					...prevSchema.fields.contributor,
					zodSchema: z.nativeEnum(contributorsObj),
				},
			},
		}));
	};

	async function onSubmit(schema: typeof initialFormSchema) {
		startTransition(async () => {
			try {
				if (!contributionId) return;
				let res;
				const data: ContributionUpdateInput = {
					amount: schema.fields.amount.value as number,
					currency: schema.fields.currency.value as string,
					amountChf: schema.fields.amountChf.value as number,
					feesChf: schema.fields.feesChf.value as number,
					contributor: {
						connect: { id: schema.fields.contributor.value as string },
					},
					status: schema.fields.status.value as ContributionStatus,
					campaign: {
						connect: { id: schema.fields.campgaign.value as string },
					},
				};
				res = await updateContributionAction({ id: contributionId, ...data });
				res.success ? onSuccess?.() : onError?.(res.error);
			} catch (error: unknown) {
				onError?.(error);
			}
		});
	}

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			mode={readOnly ? 'readonly' : 'edit'}
		/>
	);
}
