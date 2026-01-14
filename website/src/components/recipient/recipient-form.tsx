'use client';

import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { getContactValuesFromPayload, getZodEnum } from '@/components/dynamic-form/helper';
import {
	createRecipientAction,
	getRecipientAction,
	getRecipientOptions,
	updateRecipientAction,
} from '@/lib/server-actions/recipient-actions';
import { LocalPartnerOption } from '@/lib/services/local-partner/local-partner.types';
import { ProgramOption } from '@/lib/services/program/program.types';
import { RecipientCreateInput, RecipientPayload, RecipientUpdateInput } from '@/lib/services/recipient/recipient.types';
import { PaymentProvider, RecipientStatus } from '@prisma/client';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateRecipientInput, buildUpdateRecipientInput } from './recipient-form-helpers';

type RecipientFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	readOnly?: boolean;
	recipientId?: string;
	programId?: string;
};

export type RecipientFormSchema = {
	label: string;
	fields: {
		startDate: FormField;
		status: FormField;
		successorName: FormField;
		termsAccepted: FormField;
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
};

const initialFormSchema: RecipientFormSchema = {
	label: 'Recipients',
	fields: {
		startDate: {
			label: 'Start Date',
			zodSchema: z.date().min(new Date('2020-01-01')).max(new Date('2050-12-31')).optional(),
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
					zodSchema: z.string().nullable(),
				},
				phone: {
					placeholder: 'Phone Number',
					label: 'Phone Number',
					zodSchema: z
						.string()
						.regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in valid E.164 format (e.g., +12345678901)'),
				},
			},
		},
		contact: {
			...getContactFormSchema(),
		},
	},
};

export function RecipientForm({ onSuccess, onError, onCancel, recipientId, readOnly, programId }: RecipientFormProps) {
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(initialFormSchema);
	const [recipient, setRecipient] = useState<RecipientPayload>();
	const [isLoading, startTransition] = useTransition();

	const loadRecipient = async (recipientId: string) => {
		try {
			const result = await getRecipientAction(recipientId);
			if (result.success) {
				setRecipient(result.data);
				const newSchema = { ...formSchema };
				const contactValues = getContactValuesFromPayload(result.data.contact, newSchema.fields.contact.fields);
				newSchema.fields.startDate.value = result.data.startDate ?? undefined;
				newSchema.fields.status.value = result.data.status;
				newSchema.fields.successorName.value = result.data.successorName;
				newSchema.fields.termsAccepted.value = result.data.termsAccepted;
				newSchema.fields.program.value = result.data.program?.id;
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
	};

	const setOptions = (localPartner: LocalPartnerOption[], programs: ProgramOption[]) => {
		const optionsToZodEnum = (options: LocalPartnerOption[] | ProgramOption[]) =>
			getZodEnum(options.map(({ id, name }) => ({ id, label: name })));

		const partnersObj = optionsToZodEnum(localPartner);

		const programsToFilter = programs
			// filter by program id if in program scope
			.filter((p) => !programId || p.id === programId);

		const programsObj = optionsToZodEnum(programsToFilter);

		setFormSchema((prevSchema) => ({
			...prevSchema,
			fields: {
				...prevSchema.fields,
				localPartner: {
					...prevSchema.fields.localPartner,
					zodSchema: z.nativeEnum(partnersObj),
				},
				program: {
					...prevSchema.fields.program,
					zodSchema: z.nativeEnum(programsObj),
				},
			},
		}));
	};

	const onSubmit = (schema: RecipientFormSchema) => {
		startTransition(async () => {
			try {
				let res: { success: boolean; error?: string };
				const contactFields = schema.fields.contact.fields as { [key: string]: FormField };

				if (recipientId && recipient) {
					const data: RecipientUpdateInput = buildUpdateRecipientInput(schema, recipient, contactFields);
					const nextPaymentPhoneNumber = schema.fields.paymentInformation.fields.phone.value ?? null;
					res = await updateRecipientAction(data, nextPaymentPhoneNumber);
				} else {
					const data: RecipientCreateInput = buildCreateRecipientInput(schema, contactFields);
					res = await createRecipientAction(data);
				}

				res.success ? onSuccess?.() : onError?.(res.error);
			} catch (error: unknown) {
				onError?.(error);
			}
		});
	};

	useEffect(() => {
		if (recipientId) {
			// Load recipient in edit mode
			startTransition(async () => await loadRecipient(recipientId));
		}
	}, [recipientId]);

	useEffect(() => {
		// load options for program and local partners
		startTransition(async () => {
			const { programs, localPartner } = await getRecipientOptions();
			if (!programs.success || !localPartner.success) return;
			setOptions(localPartner.data, programs.data);
		});
	}, []);
	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			mode={readOnly ? 'readonly' : recipientId ? 'edit' : 'add'}
		/>
	);
}
