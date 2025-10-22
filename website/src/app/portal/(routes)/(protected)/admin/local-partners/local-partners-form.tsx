'use client';

import {
	createLocalPartnerAction,
	getLocalPartnerAction,
	updateLocalPartnerAction,
} from '@/app/portal/server-actions/create-local-partner-action';
import { formSchema as contactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
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
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
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
						newSchema.name.value = partner.data.name;
						newSchema.contact.firstName.value = partner.data.contact.firstName;
						newSchema.contact.lastName.value = partner.data.contact.lastName;
						newSchema.contact.callingName.value = partner.data.contact.callingName;
						newSchema.contact.email.value = partner.data.contact.email;
						newSchema.contact.language.value = partner.data.contact.language;
						newSchema.contact.profession.value = partner.data.contact.profession;
						newSchema.contact.phone.value = partner.data.contact.phone?.number;
						newSchema.contact.dateOfBirth.value = partner.data.contact.dateOfBirth;
						newSchema.contact.gender.value = partner.data.contact.gender?.toString();
						newSchema.contact.city.value = partner.data.contact.address?.city;
						newSchema.contact.country.value = partner.data.contact.address?.country;
						newSchema.contact.number.value = partner.data.contact.address?.number;
						newSchema.contact.street.value = partner.data.contact.address?.street;
						newSchema.contact.zip.value = partner.data.contact.address?.zip;
						setFormSchema(newSchema);
					} else {
						onError?.(partner.error);
					}
				} catch (error: unknown) {
					onError?.(error);
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
					const address = {
						street: schema.contact.street.value,
						number: schema.contact.number.value,
						city: schema.contact.city.value,
						zip: schema.contact.zip.value,
						country: schema.contact.country.value,
					};
					const data: LocalPartnerUpdateInput = {
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
														id: localPartner?.contact.phone?.id,
													},
												},
											}
										: undefined,
									dateOfBirth: schema.contact.dateOfBirth.value,
									callingName: schema.contact.callingName.value,
									language: schema.contact.language.value,
									address: {
										upsert: {
											update: address,
											create: address,
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
			mode={editing ? 'edit' : 'add'}
		/>
	);
}
