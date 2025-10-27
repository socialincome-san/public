'use client';

import { formSchema as contactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { getContactValuesFromPayload, getZodEnum } from '@/components/dynamic-form/helper';
import { PaymentProvider, RecipientStatus } from '@prisma/client';
import { LocalPartnerRecipientOption } from '@socialincome/shared/src/database/services/local-partner/local-partner.types';
import { ProgramRecipientOption } from '@socialincome/shared/src/database/services/program/program.types';
import {
	RecipientCreateInput,
	RecipientPayload,
	RecipientUpdateInput,
} from '@socialincome/shared/src/database/services/recipient/recipient.types';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import {
	createRecipientAction,
	getRecipientAction,
	getRecipientOptions,
	updateRecipientAction,
} from '../../server-actions/create-recipient-action';

export type RecipientFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	readOnly?: boolean;
	recipientId?: string;
	userId: string;
};

export function RecipientForm({ onSuccess, onError, onCancel, recipientId, readOnly, userId }: RecipientFormProps) {
	const [programs, setPrograms] = useState<ProgramRecipientOption[] | undefined>(undefined);
	const [localPartner, setLocalPartner] = useState<LocalPartnerRecipientOption[] | undefined>(undefined);

	const initialFormSchema: {
		label: string;
		fields: {
			startDate: FormField;
			status: FormField;
			successorName: FormField;
			termsAccepted: FormField;
			// TODO: better typing
			paymentInformation: {
				label: string;
				fields: {
					provider: FormField;
					code: FormField;
					phone: FormField;
				};
			};
			program: FormField;
			localPartner: FormField;
			contact: FormSchema;
		};
	} = {
		label: 'Recipients',
		fields: {
			startDate: {
				placeholder: 'Start Date',
				label: 'Start Date',
				zodSchema: z.date().optional(),
			},
			status: {
				placeholder: 'Status',
				label: 'Status',
				zodSchema: z.nativeEnum(RecipientStatus),
			},
			successorName: {
				placeholder: 'Successor',
				label: 'Successor',
				zodSchema: z.string().nullable(),
			},
			termsAccepted: {
				placeholder: 'Terms Accepted',
				label: 'Terms Accepted',
				zodSchema: z.boolean().optional(),
			},
			program: {
				placeholder: 'Program',
				label: 'Program',
			},
			localPartner: {
				placeholder: 'Local Partner',
				label: 'Local Partner',
			},
			paymentInformation: {
				label: 'Payment Information',
				fields: {
					provider: {
						placeholder: 'Provider',
						label: 'Provider',
						zodSchema: z.nativeEnum(PaymentProvider),
					},
					code: {
						placeholder: 'Code',
						label: 'Code',
						zodSchema: z.string().min(2),
					},
					phone: {
						placeholder: 'Phone Number',
						label: 'Phone Number',
						zodSchema: z
							.string()
							// TODO: chek regex and optional
							.regex(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/gm)
							.or(z.literal(''))
							.optional(),
					},
				},
			},
			contact: {
				...contactFormSchema,
			},
		},
	};

	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(initialFormSchema);
	const [recipient, setRecipient] = useState<RecipientPayload>();
	const [isLoading, startTransition] = useTransition();
	let editing = !!recipientId;

	useEffect(() => {
		if (editing && recipientId) {
			// Load recipient in edit mode
			startTransition(async () => {
				try {
					const result = await getRecipientAction(recipientId);
					if (result.success) {
						setRecipient(result.data);
						const newSchema = { ...formSchema };
						const contactValues = getContactValuesFromPayload(result.data.contact, newSchema.fields.contact.fields);
						newSchema.fields.startDate.value = result.data.startDate;
						newSchema.fields.status.value = result.data.status;
						newSchema.fields.successorName.value = result.data.successorName;
						newSchema.fields.termsAccepted.value = result.data.termsAccepted;
						newSchema.fields.program.value = result.data.program.id;
						newSchema.fields.localPartner.value = result.data.localPartner.id;
						newSchema.fields.paymentInformation.fields.provider.value = result.data.paymentInformation?.provider;
						newSchema.fields.paymentInformation.fields.code.value = result.data.paymentInformation?.code;
						newSchema.fields.paymentInformation.fields.phone.value = result.data.paymentInformation?.phone?.number;
						newSchema.fields.contact.fields = contactValues;
						setFormSchema(newSchema);
					} else {
						onError?.(result.error);
					}
				} catch (error: unknown) {
					onError?.(error);
				}
			});
		}
	}, [recipientId]);

	useEffect(() => {
		async function getOptions() {
			const { programs, localPartner } = await getRecipientOptions(userId);
			if (programs.success) setPrograms(programs.data);
			if (localPartner.success) setLocalPartner(localPartner.data);
		}
		getOptions();
	}, [userId]);

	// TODO:
	useEffect(() => {
		if (localPartner && programs) {
			const partnersObj = getZodEnum(
				localPartner.map((r) => ({
					id: r.id,
					label: r.name,
				})),
			);
			const programsObj = getZodEnum(
				programs.map((r) => ({
					id: r.id,
					label: r.name,
				})),
			);
			formSchema.fields.localPartner.zodSchema = z.nativeEnum(partnersObj);
			formSchema.fields.program.zodSchema = z.nativeEnum(programsObj);
		}
	}, [localPartner, programs]);

	const onSubmit = (schema: typeof initialFormSchema) => {
		startTransition(async () => {
			try {
				let res;
				const contactFields: {
					[key: string]: FormField;
				} = schema.fields.contact.fields;
				if (editing) {
					const address = {
						street: contactFields.street.value,
						number: contactFields.number.value,
						city: contactFields.city.value,
						zip: contactFields.zip.value,
						country: contactFields.country.value,
					};
					const paymenInformation = {
						provider: schema.fields.paymentInformation.fields.provider.value,
						code: schema.fields.paymentInformation.fields.code.value,
						phone: schema.fields.paymentInformation.fields.phone.value
							? {
									upsert: {
										update: {
											number: schema.fields.paymentInformation.fields.phone.value,
										},
										create: {
											number: schema.fields.paymentInformation.fields.phone.value,
										},
										where: {
											id: recipient?.paymentInformation?.phone?.id,
										},
									},
								}
							: undefined,
					};
					const data: RecipientUpdateInput = {
						id: recipient?.id,
						startDate: schema.fields.startDate.value,
						status: schema.fields.status.value,
						localPartner: {
							connect: {
								id: schema.fields.localPartner.value,
							},
						},
						program: {
							connect: {
								id: schema.fields.program.value,
							},
						},
						paymentInformation: {
							upsert: {
								create: {
									...paymenInformation,
									phone: schema.fields.paymentInformation.fields.phone.value
										? {
												create: {
													number: schema.fields.paymentInformation.fields.phone.value,
												},
											}
										: undefined,
								},
								update: paymenInformation,
								where: {
									id: recipient?.paymentInformation?.id,
								},
							},
						},
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
													},
													where: {
														id: recipient?.contact.phone?.id,
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
												id: recipient?.contact.address?.id,
											},
										},
									},
								},
								where: {
									id: recipient?.contact.id,
								},
							},
						},
					};
					res = await updateRecipientAction(data);
				} else {
					const recipient: RecipientCreateInput = {
						startDate: schema.fields.startDate.value,
						status: schema.fields.status.value,
						localPartner: {
							connect: {
								id: schema.fields.localPartner.value,
							},
						},
						program: {
							connect: {
								id: schema.fields.program.value,
							},
						},
						paymentInformation: {
							create: {
								provider: schema.fields.paymentInformation.fields.provider.value,
								code: schema.fields.paymentInformation.fields.code.value,
								phone: schema.fields.paymentInformation.fields.phone.value
									? {
											create: {
												number: schema.fields.paymentInformation.fields.phone.value,
											},
										}
									: undefined,
							},
						},
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
					res = await createRecipientAction(recipient);
				}
				res.success ? onSuccess?.() : onError?.(res.error);
			} catch (error: unknown) {
				onError?.(error);
			}
		});
	};

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			mode={readOnly ? 'readonly' : editing ? 'edit' : 'add'}
		/>
	);
}
