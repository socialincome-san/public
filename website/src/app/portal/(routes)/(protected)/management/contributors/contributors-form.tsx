'use client';

import { getContributorAction, updateContributorAction } from '@/app/portal/server-actions/contributor-actions';
import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { getContactValuesFromPayload } from '@/components/dynamic-form/helper';
import { ContributorReferralSource } from '@prisma/client';
import {
	ContributorPayload,
	ContributorUpdateInput,
} from '@socialincome/shared/src/database/services/contributor/contributor.types';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildUpdateContributorsInput } from './contributors-form-helper';
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
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(initialFormSchema);
	const [contributor, setContributor] = useState<ContributorPayload>();
	const [isLoading, startTransition] = useTransition();

	useEffect(() => {
		if (contributorId) {
			// Load contributor
			startTransition(async () => await loadContributor(contributorId));
		}
	}, [contributorId]);

	const loadContributor = async (id: string) => {
		startTransition(async () => {
			if (contributorId) {
				try {
					const result = await getContributorAction(contributorId);
					if (result.success) {
						setContributor(result.data);
						const newSchema = { ...formSchema };
						const contactValues = getContactValuesFromPayload(result.data.contact, newSchema.fields.contact.fields);
						newSchema.fields.referral.value = result.data.referral;
						newSchema.fields.paymentReferenceId.value = result.data.paymentReferenceId;
						newSchema.fields.stripeCustomerId.value = result.data.stripeCustomerId;
						newSchema.fields.contact.fields = contactValues;
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

	async function onSubmit(schema: typeof initialFormSchema) {
		startTransition(async () => {
			try {
				if (!contributor || !contributorId) return;
				let res;
				const data: ContributorUpdateInput = buildUpdateContributorsInput(schema, contributor);
				res = await updateContributorAction({ id: contributorId, ...data });
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
