'use client';

import {
	getFormSchema as getContactFormSchema,
	type PortalSharedTranslator,
} from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { type FormField, type FormSchema } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema, getContactValuesFromPayload } from '@/components/dynamic-form/helper';
import { ContributorReferralSource } from '@/generated/prisma/enums';
import { handleResult } from '@/lib/result-client';
import {
	createContributorAction,
	getContributorAction,
	updateContributorAction,
} from '@/modules/contributors/contributor.actions';
import { ContributorPayload } from '@/modules/contributors/contributor.types';
import { useTranslations } from 'next-intl';
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

const createInitialFormSchema = (
	t: ReturnType<typeof useTranslations<'portal-management'>>,
	sharedTranslate: PortalSharedTranslator,
): ContributorFormSchema => ({
	label: t('forms.contributor.section'),
	fields: {
		referral: {
			placeholder: t('forms.contributor.referral'),
			label: t('forms.contributor.referral'),
			zodSchema: z.nativeEnum(ContributorReferralSource),
		},
		paymentReferenceId: {
			placeholder: t('forms.contributor.paymentReferenceId'),
			label: t('forms.contributor.paymentReferenceId'),
			zodSchema: z.string().nullable(),
		},
		stripeCustomerId: {
			placeholder: t('forms.contributor.stripeCustomerId'),
			label: t('forms.contributor.stripeCustomerId'),
			zodSchema: z.string().nullable(),
			disabled: true,
		},
		contact: getContactFormSchema(sharedTranslate, { isEmailRequired: true }),
	},
});

export default function ContributorsForm({
	onSuccess,
	onError,
	onCancel,
	contributorId,
}: {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	contributorId?: string;
}) {
	const t = useTranslations('portal-management');
	const sharedTranslate = useTranslations('portal-shared');
	const [formSchema, setFormSchema] = useState<ContributorFormSchema>(() =>
		cloneFormSchema(createInitialFormSchema(t, sharedTranslate)),
	);
	const [contributor, setContributor] = useState<ContributorPayload>();
	const [isLoading, startTransition] = useTransition();

	const onSubmit = (schema: ContributorFormSchema) => {
		startTransition(async () => {
			if (contributorId && contributor?.id !== contributorId) {
				return onError?.(t('validation.contributorLoading'));
			}
			const res =
				contributorId && contributor
					? await updateContributorAction(buildUpdateContributorsInput(schema, contributor))
					: await createContributorAction(buildCreateContributorInput(schema));
			handleResult(res, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	useEffect(() => {
		if (contributorId) {
			startTransition(async () => {
				const result = await getContributorAction(contributorId);
				handleResult(result, {
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

	const mode: 'edit' | 'add' = contributorId ? 'edit' : 'add';

	return <DynamicForm formSchema={formSchema} isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} mode={mode} />;
}
