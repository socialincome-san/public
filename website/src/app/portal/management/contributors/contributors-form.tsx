'use client';

import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
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

const createInitialFormSchema = (t: ReturnType<typeof useTranslations<'portal-management'>>): ContributorFormSchema => {
	const contact = getContactFormSchema({ isEmailRequired: true });
	contact.label = t('forms.contact.section');
	const contactFields: Record<string, { label: string; placeholder?: string }> = {
		firstName: { label: t('forms.contact.firstName'), placeholder: t('forms.contact.firstName') },
		lastName: { label: t('forms.contact.lastName'), placeholder: t('forms.contact.lastName') },
		callingName: { label: t('forms.contact.callingName'), placeholder: t('forms.contact.callingName') },
		email: { label: t('forms.contact.email'), placeholder: t('forms.contact.email') },
		language: { label: t('forms.contact.language'), placeholder: t('forms.contact.language') },
		dateOfBirth: { label: t('forms.contact.dateOfBirth') },
		profession: { label: t('forms.contact.profession'), placeholder: t('forms.contact.profession') },
		gender: { label: t('forms.contact.gender'), placeholder: t('forms.contact.chooseGender') },
		phone: { label: t('forms.contact.phone'), placeholder: t('forms.contact.phone') },
		hasWhatsApp: { label: t('forms.contact.hasWhatsApp') },
		street: { label: t('forms.contact.street'), placeholder: t('forms.contact.street') },
		number: { label: t('forms.contact.number'), placeholder: t('forms.contact.number') },
		city: { label: t('forms.contact.city'), placeholder: t('forms.contact.city') },
		zip: { label: t('forms.contact.zip'), placeholder: t('forms.contact.zip') },
		country: { label: t('forms.contact.country'), placeholder: t('forms.contact.country') },
	};
	for (const [key, value] of Object.entries(contact.fields)) {
		if ('label' in value && contactFields[key]) {
			value.label = contactFields[key].label;
			if (!('fields' in value) && contactFields[key].placeholder) {
				value.placeholder = contactFields[key].placeholder;
			}
		}
	}

	return {
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
			contact: {
				...contact,
			},
		},
	};
};

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
	const [formSchema, setFormSchema] = useState<ContributorFormSchema>(() => cloneFormSchema(createInitialFormSchema(t)));
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
