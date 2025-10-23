'use client';

import { formSchema as contactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { getContactValuesFromPayload, getZodEnum } from '@/components/dynamic-form/helper';
import { RecipientStatus } from '@prisma/client';
import { LocalPartnerTableView } from '@socialincome/shared/src/database/services/local-partner/local-partner.types';
import { ProgramWalletView } from '@socialincome/shared/src/database/services/program/program.types';
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
	const [programs, setPrograms] = useState<ProgramWalletView | undefined>(undefined);
	const [localPartner, setLocalPartner] = useState<LocalPartnerTableView | undefined>(undefined);

	const initialFormSchema: {
		label: string;
		fields: {
			startDate: FormField;
			status: FormField;
			successorName: FormField;
			termsAccepted: FormField;
			// paymentInformation: FormField;
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
				zodSchema: z.date().nullable(),
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
			// paymentInformation: {
			// 	placeholder: 'Name',
			// 	label: 'Name',
			// 	zodSchema: z.nativeEnum(),
			// },
			program: {
				placeholder: 'Program',
				label: 'Program',
			},
			localPartner: {
				placeholder: 'Local Partner',
				label: 'Local Partner',
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
		if (localPartner?.tableRows && programs?.wallets) {
			const partnersObj = getZodEnum(
				localPartner.tableRows.map((r) => ({
					id: r.id,
					label: r.name,
				})),
			);
			const programsObj = getZodEnum(
				programs.wallets.map((r) => ({
					id: r.id,
					label: r.programName,
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
