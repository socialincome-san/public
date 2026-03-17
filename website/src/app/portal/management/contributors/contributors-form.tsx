'use client';

import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema, getContactValuesFromPayload } from '@/components/dynamic-form/helper';
import { ContributorReferralSource } from '@/generated/prisma/enums';
import {
	createContributorAction,
	getContributorAction,
	updateContributorAction,
} from '@/lib/server-actions/contributor-actions';
import { ContributorPayload } from '@/lib/services/contributor/contributor.types';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
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
	const [formSchema, setFormSchema] = useState<ContributorFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [contributor, setContributor] = useState<ContributorPayload>();
	const [isLoading, startTransition] = useTransition();

	const onSubmit = (schema: ContributorFormSchema) => {
		startTransition(async () => {
			if (contributorId && contributor?.id !== contributorId) {
				return onError?.('Contributor is still loading. Please try again.');
			}
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
							const nextSchema = clearFormSchemaValues(previousSchema);
							const contactFields = {
								...nextSchema.fields.contact.fields,
							};
							const contactValues = getContactValuesFromPayload(data.contact, contactFields);

							return {
								...nextSchema,
								fields: {
									...nextSchema.fields,
									referral: {
										...nextSchema.fields.referral,
										value: data.referral,
									},
									paymentReferenceId: {
										...nextSchema.fields.paymentReferenceId,
										value: data.paymentReferenceId,
									},
									stripeCustomerId: {
										...nextSchema.fields.stripeCustomerId,
										value: data.stripeCustomerId,
									},
									contact: {
										...nextSchema.fields.contact,
										fields: contactValues,
									},
								},
							};
						});
					},
					onError: (error) => onError?.(error),
				});
			});
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
