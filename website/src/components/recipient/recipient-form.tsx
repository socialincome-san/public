'use client';

import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { getContactValuesFromPayload, getZodEnum } from '@/components/dynamic-form/helper';
import type { Session } from '@/lib/firebase/current-account';
import { getSupportedMobileMoneyProviderOptionsAction } from '@/lib/server-actions/mobile-money-provider-action';
import {
	createRecipientAction,
	deleteRecipientAction,
	getRecipientAction,
	getRecipientOptions,
	updateRecipientAction,
} from '@/lib/server-actions/recipient-actions';
import { LocalPartnerOption } from '@/lib/services/local-partner/local-partner.types';
import { ProgramOption } from '@/lib/services/program/program.types';
import { RecipientCreateInput, RecipientPayload, RecipientUpdateInput } from '@/lib/services/recipient/recipient.types';
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
	sessionType?: Session['type'];
};

export type RecipientFormSchema = {
	label: string;
	fields: {
		startDate: FormField;
		suspendedAt: FormField;
		suspensionReason: FormField;
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
		program?: FormField;
		localPartner?: FormField;
		contact: FormSchema;
	};
};

const getInitialFormSchema = (sessionType: Session['type'] = 'user'): RecipientFormSchema => {
	const base: RecipientFormSchema = {
		label: 'Recipients',
		fields: {
			startDate: {
				label: 'Start Date',
				zodSchema: z.date().min(new Date('2020-01-01')).max(new Date('2050-12-31')).optional(),
			},
			suspendedAt: {
				label: 'Suspended At',
				zodSchema: z.date().min(new Date('2020-01-01')).max(new Date('2050-12-31')).optional(),
			},
			suspensionReason: {
				label: 'Suspension Reason',
				zodSchema: z.string().optional(),
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
						zodSchema: z.string().optional(),
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
							.regex(/^$|^\+[1-9]\d{1,14}$/, 'Phone number must be empty or in valid E.164 format (e.g., +12345678901)')
							.optional(),
					},
				},
			},
			contact: {
				...getContactFormSchema(),
			},
		},
	};

	if (sessionType === 'local-partner') {
		delete base.fields.program;
		delete base.fields.localPartner;
	}

	return base;
};

export const RecipientForm = ({
	onSuccess,
	onError,
	onCancel,
	recipientId,
	readOnly,
	programId,
	sessionType = 'user',
}: RecipientFormProps) => {
	const [formSchema, setFormSchema] = useState(() => getInitialFormSchema(sessionType));
	const [recipient, setRecipient] = useState<RecipientPayload>();
	const [isLoading, startTransition] = useTransition();

	const loadRecipient = async (recipientId: string) => {
		try {
			const result = await getRecipientAction(recipientId, sessionType);
			if (result.success) {
				setRecipient(result.data);
				const newSchema = { ...formSchema };
				const contactValues = getContactValuesFromPayload(result.data.contact, newSchema.fields.contact.fields);
				newSchema.fields.startDate.value = result.data.startDate ?? undefined;
				newSchema.fields.suspendedAt.value = result.data.suspendedAt;
				newSchema.fields.suspensionReason.value = result.data.suspensionReason;
				newSchema.fields.successorName.value = result.data.successorName;
				newSchema.fields.termsAccepted.value = result.data.termsAccepted;

				if (newSchema.fields.program) {
					newSchema.fields.program.value = result.data.program?.id;
				}
				if (newSchema.fields.localPartner) {
					newSchema.fields.localPartner.value = result.data.localPartner.id;
				}

				newSchema.fields.paymentInformation.fields.provider.value =
					result.data.paymentInformation?.mobileMoneyProvider?.id;
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

	const setOptions = (
		localPartner: LocalPartnerOption[],
		programs: ProgramOption[],
		mobileMoneyProviders: { id: string; name: string }[],
	) => {
		const optionsToZodEnum = (options: LocalPartnerOption[] | ProgramOption[]) =>
			getZodEnum(options.map(({ id, name }) => ({ id, label: name })));

		const partnersObj = optionsToZodEnum(localPartner);
		const programsToFilter = programs.filter((p) => !programId || p.id === programId);
		const programsObj = optionsToZodEnum(programsToFilter);

		const providerOptions = mobileMoneyProviders.map((p) => ({ id: p.id, label: p.name }));
		const providerEnum = getZodEnum(providerOptions);

		setFormSchema((prevSchema) => {
			const updated = { ...prevSchema, fields: { ...prevSchema.fields } };

			if (updated.fields.localPartner) {
				updated.fields.localPartner = {
					...updated.fields.localPartner,
					zodSchema: z.nativeEnum(partnersObj),
				};
			}
			if (updated.fields.program) {
				updated.fields.program = {
					...updated.fields.program,
					zodSchema: z.nativeEnum(programsObj),
				};
			}
			updated.fields.paymentInformation = {
				...updated.fields.paymentInformation,
				fields: {
					...updated.fields.paymentInformation.fields,
					provider: {
						...updated.fields.paymentInformation.fields.provider,
						options: providerOptions,
						zodSchema: providerOptions.length > 0 ? z.nativeEnum(providerEnum) : z.string().optional(),
					},
				},
			};

			return updated;
		});
	};

	const onSubmit = (schema: RecipientFormSchema) => {
		startTransition(async () => {
			try {
				let res: { success: boolean; error?: string };
				const contactFields = schema.fields.contact.fields as { [key: string]: FormField };

				if (recipientId && recipient) {
					const data: RecipientUpdateInput = buildUpdateRecipientInput(schema, recipient, contactFields);
					const nextPaymentPhoneNumber = schema.fields.paymentInformation.fields.phone.value ?? null;
					res = await updateRecipientAction(data, nextPaymentPhoneNumber, sessionType);
				} else {
					const data: RecipientCreateInput = buildCreateRecipientInput(schema, contactFields);
					res = await createRecipientAction(data, sessionType);
				}

				res.success ? onSuccess?.() : onError?.(res.error);
			} catch (error: unknown) {
				onError?.(error);
			}
		});
	};

	const onDelete = () => {
		if (!recipientId) {
			return;
		}

		startTransition(async () => {
			try {
				const result = await deleteRecipientAction(recipientId, sessionType);
				result.success ? onSuccess?.() : onError?.(result.error);
			} catch (error) {
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
		// load options for program, local partners, and supported mobile money providers
		startTransition(async () => {
			const [{ programs, localPartner }, supportedProviders] = await Promise.all([
				getRecipientOptions(sessionType),
				getSupportedMobileMoneyProviderOptionsAction(),
			]);
			if (!programs.success || !localPartner.success) {
				return;
			}
			setOptions(localPartner.data, programs.data, supportedProviders.success ? supportedProviders.data : []);
		});
	}, [sessionType, programId]);

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			onDelete={onDelete}
			mode={readOnly ? 'readonly' : recipientId ? 'edit' : 'add'}
		/>
	);
};
