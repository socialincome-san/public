'use client';

import {
	createLocalPartnerAction,
	getLocalPartnerAction,
	updateLocalPartnerAction,
} from '@/app/portal/server-actions/create-local-partner-action';
import { formSchema as contactFormSchema } from '@/components/dynamicForm/contactFormSchemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamicForm/dynamicForm';
import { LocalPartnerPayload } from '@socialincome/shared/src/database/services/local-partner/local-partner.types';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';

export default function LocalPartnersForm({
	onSuccess,
	onError,
	localPartnerId,
}: {
	onSuccess?: () => void;
	onError?: () => void;
	localPartnerId?: string;
}) {
	const initialFormSchema: {
		name: FormField;
		contact: FormSchema;
	} = {
		name: {
			placeholder: 'Name',
			label: 'Name',
			zodSchema: z.string(),
		},
		contact: {
			...contactFormSchema,
		},
	};

	const [formSchema, setFormSchema] = useState<FormSchema>(initialFormSchema);
	const [localePartner, setLocalePartner] = useState<LocalPartnerPayload>();
	const [isLoading, startTransition] = useTransition();
	let editing = !!localPartnerId;

	useEffect(() => {
		if (editing && localPartnerId) {
			// Load local partner in edit mode
			startTransition(async () => {
				try {
					const partner = await getLocalPartnerAction(localPartnerId);
					if (partner.success) {
						setLocalePartner(partner.data);
						const newSchema = { ...formSchema };
						newSchema.name.value = partner.data.name;
						newSchema.firstName.value = partner.data.contact.firstName;
						newSchema.lastName.value = partner.data.contact.lastName;
						newSchema.callingName.value = partner.data.contact.callingName;
						newSchema.email.value = partner.data.contact.email;
						newSchema.language.value = partner.data.contact.language;
						newSchema.profession.value = partner.data.contact.profession;
						newSchema.phone.value = partner.data.contact.phone?.number;
						newSchema.dateOfBirth.value = partner.data.contact.dateOfBirth;
						newSchema.gender.value = partner.data.contact.gender?.toString();
						setFormSchema(newSchema);
					} else {
						onError && onError();
					}
				} catch {
					onError && onError();
				}
			});
		}
	}, [localPartnerId]);

	async function onSubmit(schema: typeof initialFormSchema) {
		startTransition(async () => {
			try {
				let res;
				if (editing) {
					// TODO: move mapping to server action
					const data = {
						name: schema.name.value,
						contact: {
							update: {
								data: {
									firstName: schema.contact.firstName.value,
									lastName: schema.contact.lastName.value,
									gender: schema.contact.gender.value,
									email: schema.contact.email.value,
									profession: schema.contact.profession.value,
									phone: schema.contact.phone.value
										? {
												update: {
													data: {
														number: schema.contact.phone.value,
													},
													where: {
														id: localePartner?.contact.phone?.id,
													},
												},
											}
										: undefined,
									dateOfBirth: schema.contact.dateOfBirth.value,
									callingName: schema.contact.callingName.value,
									language: schema.contact.language.value,
									address: {
										update: {
											data: {
												street: schema.contact.street.value,
												number: schema.contact.number.value,
												city: schema.contact.city.value,
												zip: schema.contact.zip.value,
												country: schema.contact.country.value,
											},
											where: {
												id: localePartner?.contact.address?.id,
											},
										},
									},
								},
								where: {
									id: localePartner?.contact.id,
								},
							},
						},
					};
					res = await updateLocalPartnerAction({ id: localPartnerId, ...data });
				} else {
					// TODO: move mapping to server action
					const data = {
						name: schema.name.value,
						contact: {
							create: {
								firstName: schema.contact.firstName.value,
								lastName: schema.contact.lastName.value,
								gender: schema.contact.gender.value,
								email: schema.contact.email.value,
								profession: schema.contact.profession.value,
								phone: schema.contact.phone.value
									? {
											create: {
												number: schema.contact.phone.value,
											},
										}
									: undefined,
								dateOfBirth: schema.contact.dateOfBirth.value,
								callingName: schema.contact.callingName.value,
								language: schema.contact.language.value,
								address: {
									create: {
										street: schema.contact.street.value,
										number: schema.contact.number.value,
										city: schema.contact.city.value,
										zip: schema.contact.zip.value,
										country: schema.contact.country.value,
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

	return <DynamicForm formSchema={formSchema} isLoading={isLoading} onSubmit={onSubmit} />;
}
