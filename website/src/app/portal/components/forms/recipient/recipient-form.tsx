'use client';

import { formSchema as contactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { getContactValuesFromPayload, getZodEnum } from '@/components/dynamic-form/helper';
import { PaymentProvider, RecipientStatus } from '@prisma/client';
import { LocalPartnerOption } from '@socialincome/shared/src/database/services/local-partner/local-partner.types';
import { ProgramOption } from '@socialincome/shared/src/database/services/program/program.types';
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
} from '../../../server-actions/recipient-actions';
import { buildCreateRecipientInput, buildUpdateRecipientInput } from './recipient-form-helpers';

export type RecipientFormProps = {
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
					zodSchema: z.string().min(1, {
						message: 'Code must be at least one characters.',
					}),
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

export function RecipientForm({ onSuccess, onError, onCancel, recipientId, readOnly, programId }: RecipientFormProps) {
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(initialFormSchema);
	const [recipient, setRecipient] = useState<RecipientPayload>();
	const [isLoading, startTransition] = useTransition();

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
				let res: { success: boolean; error?: unknown };
				const contactFields = schema.fields.contact.fields as { [key: string]: FormField };

				if (recipientId && recipient) {
					const data: RecipientUpdateInput = buildUpdateRecipientInput(schema, recipient, contactFields);
					res = await updateRecipientAction(data);
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
