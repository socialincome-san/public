'use client';

import { getContributorAction, updateContributorAction } from '@/app/portal/server-actions/contributor-actions';
import { formSchema as contactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { getContactValuesFromPayload } from '@/components/dynamic-form/helper';
import { ContributorReferralSource } from '@prisma/client';
import {
	ContributorPayload,
	ContributorUpdateInput,
} from '@socialincome/shared/src/database/services/contributor/contributor.types';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';

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
	const initialFormSchema: {
		label: string;
		fields: {
			referral: FormField;
			paymentReferenceId: FormField;
			stripeCustomerId: FormField;
			contact: FormSchema;
		};
	} = {
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
				...contactFormSchema,
			},
		},
	};

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
				let res;
				const contactFields: {
					[key: string]: FormField;
				} = schema.fields.contact.fields;
				// TODO: move mapping to server action
				const address = {
					street: contactFields.street.value,
					number: contactFields.number.value,
					city: contactFields.city.value,
					zip: contactFields.zip.value,
					country: contactFields.country.value,
				};
				const data: ContributorUpdateInput = {
					referral: schema.fields.referral.value,
					paymentReferenceId: schema.fields.paymentReferenceId.value,
					stripeCustomerId: schema.fields.stripeCustomerId.value,
					contact: {
						update: {
							data: {
								firstName: contactFields.firstName.value,
								lastName: contactFields.lastName.value,
								gender: contactFields.gender.value,
								email: contactFields.email.value,
								profession: contactFields.profession.value,
								phone: contactFields.phone.value
									? {
											update: {
												data: {
													number: contactFields.phone.value,
													hasWhatsApp: contactFields.hasWhatsApp.value,
												},
												where: {
													id: contributor?.contact.phone?.id,
												},
											},
										}
									: undefined,
								dateOfBirth: contactFields.dateOfBirth.value,
								callingName: contactFields.callingName.value,
								language: contactFields.language.value,
								address: {
									upsert: {
										update: address,
										create: address,
										where: {
											id: contributor?.contact.address?.id,
										},
									},
								},
							},
							where: {
								id: contributor?.contact.id,
							},
						},
					},
				};
				res = await updateContributorAction({ id: contributorId, ...data });
				res.success ? onSuccess?.() : onError?.(res.error);
			} catch (error: unknown) {
				onError?.(error);
			}
		});
	}

	return (
		<DynamicForm formSchema={formSchema} isLoading={isLoading} onSubmit={onSubmit} onCancel={onCancel} mode={'edit'} />
	);
}
