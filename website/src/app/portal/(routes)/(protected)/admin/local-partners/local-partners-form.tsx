'use client';

import {
	createLocalPartnerAction,
	getLocalPartnerAction,
	updateLocalPartnerAction,
} from '@/app/portal/server-actions/local-partner-action';
import { formSchema as contactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema, getValueFromFormField } from '@/components/dynamic-form/dynamic-form';
import { getContactValuesFromPayload } from '@/components/dynamic-form/helper';
import {
	LocalPartnerCreateInput,
	LocalPartnerPayload,
	LocalPartnerUpdateInput,
} from '@socialincome/shared/src/database/services/local-partner/local-partner.types';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';

export default function LocalPartnersForm({
	onSuccess,
	onError,
	onCancel,
	localPartnerId,
}: {
	onSuccess?: () => void;
	onError?: () => void;
	onCancel?: () => void;
	localPartnerId?: string;
}) {
	// const initialFormSchema: FormSchema = {
	const initialFormSchema: {
		label: string;
		fields: {
			name: FormField;
			contact: FormSchema;
		};
	} = {
		label: 'Local Partner',
		fields: {
			name: {
				placeholder: 'Name',
				label: 'Name',
				zodSchema: z.string(),
			},
			contact: {
				...contactFormSchema,
			},
		},
	};

	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(initialFormSchema);
	const [localPartner, setLocalPartner] = useState<LocalPartnerPayload>();
	const [isLoading, startTransition] = useTransition();
	let editing = !!localPartnerId;

	useEffect(() => {
		if (editing && localPartnerId) {
			// Load local partner in edit mode
			startTransition(async () => {
				try {
					const partner = await getLocalPartnerAction(localPartnerId);
					if (partner.success) {
						setLocalPartner(partner.data);
						const newSchema = { ...formSchema };
						newSchema.fields.name.value = partner.data.name;
						const contactValues = getContactValuesFromPayload(partner.data, newSchema.fields.contact.fields);
						console.log('contactValues: ', contactValues);
						newSchema.fields.contact.fields = contactValues;
						console.log('newSchema: ', newSchema);
						setFormSchema(newSchema);
					} else {
						onError && onError();
					}
				} catch (e) {
					console.error('ERROR: ', e);
					onError && onError();
				}
			});
		}
	}, [localPartnerId]);

	async function onSubmit(schema: typeof initialFormSchema) {
		startTransition(async () => {
			try {
				let res;
				// TODO: remove casting
				// const contactFields: {
				// 	[key: string]: FormField;
				// } = schema.fields.contact.fields;
				const contactFields = schema.fields.contact.fields;
				if (editing) {
					// TODO: move mapping to server action
					const data: LocalPartnerUpdateInput = {
						name: schema.fields.name.value,
						contact: {
							update: {
								data: {
									firstName: getValueFromFormField(contactFields.firstName),
									lastName: contactFields.lastName.value,
									gender: contactFields.gender.value,
									email: contactFields.email.value,
									profession: contactFields.profession.value,
									phone: contactFields.phone.value
										? {
												update: {
													data: {
														number: contactFields.phone.value,
													},
													where: {
														id: localPartner?.contact.phone?.id,
													},
												},
											}
										: undefined,
									dateOfBirth: contactFields.dateOfBirth.value,
									callingName: contactFields.callingName.value,
									language: contactFields.language.value,
									address: {
										update: {
											data: {
												street: contactFields.street.value,
												number: contactFields.number.value,
												city: contactFields.city.value,
												zip: contactFields.zip.value,
												country: contactFields.country.value,
											},
											where: {
												id: localPartner?.contact.address?.id,
											},
										},
									},
								},
								where: {
									id: localPartner?.contact.id,
								},
							},
						},
					};
					res = await updateLocalPartnerAction({ id: localPartnerId, ...data });
				} else {
					// TODO: move mapping to server action
					const data: LocalPartnerCreateInput = {
						name: schema.fields.name.value,
						contact: {
							create: {
								firstName: contactFields.firstName.value,
								lastName: contactFields.lastName.value,
								gender: contactFields.gender.value,
								email: contactFields.email.value,
								profession: contactFields.profession.value,
								phone: contactFields.phone.value
									? {
											create: {
												number: contactFields.phone.value,
											},
										}
									: undefined,
								dateOfBirth: contactFields.dateOfBirth.value,
								callingName: contactFields.callingName.value,
								language: contactFields.language.value,
								address: {
									create: {
										street: contactFields.street.value,
										number: contactFields.number.value,
										city: contactFields.city.value,
										zip: contactFields.zip.value,
										country: contactFields.country.value,
									},
								},
							},
						},
					};
					res = await createLocalPartnerAction(data);
				}
				res.success ? onSuccess?.() : onError?.();
			} catch {
				onError?.();
			}
		});
	}

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			mode={editing ? 'edit' : 'add'}
		/>
	);
}
