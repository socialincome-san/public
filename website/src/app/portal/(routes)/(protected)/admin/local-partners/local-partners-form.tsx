'use client';

import {
	createLocalPartnerAction,
	getLocalPartnerAction,
	updateLocalPartnerAction,
} from '@/app/portal/server-actions/create-local-partner-action';
import { formSchema as contactFormSchema } from '@/components/dynamicForm/contactFormSchemas';
import DynamicForm, { FormSchema } from '@/components/dynamicForm/dynamicForm';
import { LocalPartnerPayload } from '@socialincome/shared/src/database/services/local-partner/local-partner.types';
import { Gender } from '@socialincome/shared/src/types/user';
import { useEffect, useState, useTransition } from 'react';
import z, { ZodObject, ZodTypeAny } from 'zod';

function buildZodSchema(schemaDef: FormSchema): ZodObject<any> {
	const result: Record<string, ZodTypeAny> = {};

	for (const key in schemaDef) {
		const value = schemaDef[key];

		if (value.zodSchema) {
			result[key] = value.zodSchema as ZodTypeAny;
		} else {
			// nested object
			result[key] = buildZodSchema(value as FormSchema);
		}
	}

	return z.object(result);
}

export default function LocalPartnersForm({
	onSuccess,
	onError,
	localPartnerId,
}: {
	onSuccess?: () => void;
	onError?: () => void;
	localPartnerId?: string;
}) {
	const initialFormSchema: FormSchema = {
		name: {
			placeholder: 'Name',
			label: 'Name',
			zodSchema: z.string(),
		},
		contact: {
			...contactFormSchema,
		},
	};

	const zodSchema = buildZodSchema(initialFormSchema);

	const [formSchema, setFormSchema] = useState<FormSchema>(initialFormSchema);

	const [localePartner, setLocalePartner] = useState<LocalPartnerPayload>();

	let editing = !!localPartnerId;

	// TODO
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
						// TODO
						(newSchema.contact as FormSchema).firstName.value = partner.data.contact.firstName;
						(newSchema.contact as FormSchema).lastName.value = partner.data.contact.lastName;
						(newSchema.contact as FormSchema).callingName.value = partner.data.contact.callingName;
						(newSchema.contact as FormSchema).email.value = partner.data.contact.email;
						(newSchema.contact as FormSchema).language.value = partner.data.contact.language;
						(newSchema.contact as FormSchema).profession.value = partner.data.contact.profession;
						(newSchema.contact as FormSchema).phone.value = partner.data.contact.phone?.number;
						(newSchema.contact as FormSchema).dateOfBirth.value = partner.data.contact.dateOfBirth;
						(newSchema.contact as FormSchema).gender.value = partner.data.contact.gender?.toString();
						setFormSchema(newSchema);
					}
				} catch {
					onError && onError();
				}
			});
		}
	}, [localPartnerId]);

	const [isLoading, startTransition] = useTransition();
	async function onSubmit(values: z.infer<typeof zodSchema>) {
		// TODO update data in edit mode
		startTransition(async () => {
			try {
				if (editing) {
					// TODO: move to server action
					const data = {
						name: values.name,
						contact: {
							update: {
								data: {
									firstName: values.contact.firstName,
									lastName: values.contact.lastName,
									gender: values.contact.gender as Gender,
									email: values.contact.email,
									profession: values.contact.profession,
									phone: values.contact.phone
										? {
												update: {
													data: {
														number: values.contact.phone,
													},
													where: {
														id: localePartner?.contact.phone?.id,
													},
												},
											}
										: undefined,
									dateOfBirth: values.contact.dateOfBirth,
									callingName: values.contact.callingName,
									language: values.contact.language,
									// TODO: add address
								},
								where: {
									id: localePartner?.contact.id,
								},
							},
						},
					};
					await updateLocalPartnerAction({ id: localPartnerId, ...data });
				} else {
					// TODO: move to server action
					const data = {
						name: values.name,
						contact: {
							create: {
								firstName: values.contact.firstName,
								lastName: values.contact.lastName,
								gender: values.contact.gender as Gender,
								email: values.contact.email,
								profession: values.contact.profession,
								phone: values.contact.phone
									? {
											create: {
												number: values.contact.phone,
											},
										}
									: undefined,
								dateOfBirth: values.contact.dateOfBirth,
								callingName: values.contact.callingName,
								language: values.contact.language,
								// TODO: add address
							},
						},
					};
					await createLocalPartnerAction(data);
				}
				onSuccess && onSuccess();
			} catch {
				onError && onError();
			}
		});
	}

	return (
		<>
			<DynamicForm formSchema={formSchema} isLoading={isLoading} onSubmit={onSubmit} zodSchema={zodSchema} />
		</>
	);
}
