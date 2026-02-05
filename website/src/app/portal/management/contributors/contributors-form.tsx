'use client';

import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { getContactValuesFromPayload } from '@/components/dynamic-form/helper';
import { ContributorReferralSource } from '@/generated/prisma/client';
import {
	createContributorAction,
	getContributorAction,
	updateContributorAction,
} from '@/lib/server-actions/contributor-actions';
import {
	ContributorFormCreateInput,
	ContributorPayload,
	ContributorUpdateInput,
} from '@/lib/services/contributor/contributor.types';
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

	const loadContributor = async (id: string) => {
		startTransition(async () => {
			try {
				const result = await getContributorAction(id);
				if (!result.success) {
					return onError?.(result.error);
				}

				setContributor(result.data);
				const newSchema = { ...initialFormSchema };
				const contactValues = getContactValuesFromPayload(result.data.contact, newSchema.fields.contact.fields);
				newSchema.fields.referral.value = result.data.referral;
				newSchema.fields.paymentReferenceId.value = result.data.paymentReferenceId;
				newSchema.fields.stripeCustomerId.value = result.data.stripeCustomerId;
				newSchema.fields.contact.fields = contactValues;
				setFormSchema(newSchema);
			} catch (error: unknown) {
				onError?.(error);
			}
		});
	};

	async function onSubmit(schema: ContributorFormSchema) {
		startTransition(async () => {
			try {
				let res;

				if (contributorId && contributor) {
					const updateData: ContributorUpdateInput = buildUpdateContributorsInput(schema, contributor);
					res = await updateContributorAction({ id: contributorId, ...updateData });
				} else {
					const createData: ContributorFormCreateInput = buildCreateContributorInput(schema);
					res = await createContributorAction(createData);
				}

				res.success ? onSuccess?.() : onError?.(res.error);
			} catch (error: unknown) {
				onError?.(error);
			}
		});
	}

	useEffect(() => {
		if (contributorId) {
			startTransition(async () => {
				loadContributor(contributorId);
			});
		} else {
			setContributor(undefined);
			setFormSchema(initialFormSchema);
		}
	}, [contributorId]);

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
