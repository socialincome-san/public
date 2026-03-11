'use client';

import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { getContactValuesFromPayload } from '@/components/dynamic-form/helper';
import { ContributorReferralSource } from '@/generated/prisma/enums';
import {
	createContributorAction,
	getContributorAction,
	updateContributorAction,
} from '@/lib/server-actions/contributor-actions';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import { ContributorPayload } from '@/lib/services/contributor/contributor.types';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateContributorInput, buildUpdateContributorsInput } from './contributors-form-helper';

export type ContributorFormSchema = {
	label: string;
	fields: {
		referral: FormField;
		paymentReferenceId: FormField;
		stripeCustomerId: FormField;
		contact: FormSchema;
	};
};

const initialFormSchema: ContributorFormSchema = {
	label: 'Contributor',
	fields: {
		referral: {
			placeholder: 'Referral',
			label: 'Referral',
			zodSchema: z.nativeEnum(ContributorReferralSource),
		},
		paymentReferenceId: {
			placeholder: 'Payment Reference ID',
			label: 'Payment Reference ID',
			zodSchema: z.string().nullable(),
		},
		stripeCustomerId: {
			placeholder: 'Stripe Customer ID',
			label: 'Stripe Customer ID',
			zodSchema: z.string().nullable(),
			disabled: true,
		},
		contact: {
			...getContactFormSchema({ isEmailRequired: true }),
		},
	},
};

export default function ContributorsForm({
	onSuccess,
	onError,
	onCancel,
	contributorId,
	readOnly,
}: {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	contributorId?: string;
	readOnly: boolean;
}) {
	const [formSchema, setFormSchema] = useState<ContributorFormSchema>(initialFormSchema);
	const [contributor, setContributor] = useState<ContributorPayload>();
	const [isLoading, startTransition] = useTransition();

	const onSubmit = async (schema: ContributorFormSchema) => {
		startTransition(async () => {
			const res =
				contributorId && contributor
					? await updateContributorAction(buildUpdateContributorsInput(schema, contributor))
					: await createContributorAction(buildCreateContributorInput(schema));
			handleServiceResult(res, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	useEffect(() => {
		if (contributorId) {
			startTransition(async () => {
				const result = await getContributorAction(contributorId);
				handleServiceResult(result, {
					onSuccess: (data) => {
						setContributor(data);
						setFormSchema((previousSchema) => {
							const contactFields = {
								...(previousSchema.fields.contact as FormSchema).fields,
							};
							const contactValues = getContactValuesFromPayload(data.contact, contactFields);
							return {
								...previousSchema,
								fields: {
									...previousSchema.fields,
									referral: {
										...previousSchema.fields.referral,
										value: data.referral,
									},
									paymentReferenceId: {
										...previousSchema.fields.paymentReferenceId,
										value: data.paymentReferenceId,
									},
									stripeCustomerId: {
										...previousSchema.fields.stripeCustomerId,
										value: data.stripeCustomerId,
									},
									contact: {
										...(previousSchema.fields.contact as FormSchema),
										fields: contactValues,
									},
								},
							};
						});
					},
					onError: (error) => onError?.(error),
				});
			});
		} else {
			setContributor(undefined);
			setFormSchema(initialFormSchema);
		}
	}, [contributorId, onError]);

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			mode={readOnly ? 'readonly' : contributorId ? 'edit' : 'add'}
		/>
	);
}
