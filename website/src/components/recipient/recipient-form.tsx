'use client';

import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, getContactValuesFromPayload, getZodEnum } from '@/components/dynamic-form/helper';
import type { Session } from '@/lib/firebase/current-account';
import { getSupportedMobileMoneyProviderOptionsAction } from '@/lib/server-actions/mobile-money-provider-action';
import {
	createRecipientAction,
	deleteRecipientAction,
	getRecipientAction,
	getRecipientOptions,
	updateRecipientAction,
} from '@/lib/server-actions/recipient-actions';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import { LocalPartnerOption } from '@/lib/services/local-partner/local-partner.types';
import { ProgramOption } from '@/lib/services/program/program.types';
import { RecipientPayload } from '@/lib/services/recipient/recipient.types';
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
				zodSchema: z.date().min(new Date('2020-01-01')).max(new Date('2050-12-31')).nullable().optional(),
			},
			suspendedAt: {
				label: 'Suspended At',
				zodSchema: z.date().min(new Date('2020-01-01')).max(new Date('2050-12-31')).nullable().optional(),
			},
			suspensionReason: {
				label: 'Suspension Reason',
				zodSchema: z.string().nullable().optional(),
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

	const onSubmit = (schema: RecipientFormSchema) => {
		startTransition(async () => {
			if (recipientId && recipient?.id !== recipientId) {
				return onError?.('Recipient is still loading. Please try again.');
			}
			const contactFields = schema.fields.contact.fields as Record<string, FormField>;
			const result =
				recipientId && recipient
					? await updateRecipientAction(buildUpdateRecipientInput(schema, recipient, contactFields), sessionType)
					: await createRecipientAction(buildCreateRecipientInput(schema, contactFields), sessionType);

			handleServiceResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	const onDelete = () => {
		if (!recipientId) {
			return;
		}

		startTransition(async () => {
			const result = await deleteRecipientAction(recipientId, sessionType);
			handleServiceResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	useEffect(() => {
		if (recipientId) {
			// Load recipient in edit mode
			startTransition(async () => {
				const result = await getRecipientAction(recipientId, sessionType);
				handleServiceResult(result, {
					onSuccess: (data) => {
						setRecipient(data);
						setFormSchema((previousSchema) => {
							const nextSchema = clearFormSchemaValues(previousSchema);
							const clonedContactFields = Object.fromEntries(
								Object.entries(nextSchema.fields.contact.fields).map(([key, field]) => [key, { ...field }]),
							);
							const contactValues = getContactValuesFromPayload(data.contact, clonedContactFields);

							const updatedSchema: RecipientFormSchema = {
								...nextSchema,
								fields: {
									...nextSchema.fields,
									startDate: { ...nextSchema.fields.startDate, value: data.startDate ?? undefined },
									suspendedAt: { ...nextSchema.fields.suspendedAt, value: data.suspendedAt },
									suspensionReason: { ...nextSchema.fields.suspensionReason, value: data.suspensionReason },
									successorName: { ...nextSchema.fields.successorName, value: data.successorName },
									termsAccepted: { ...nextSchema.fields.termsAccepted, value: data.termsAccepted },
									contact: {
										...nextSchema.fields.contact,
										fields: contactValues,
									},
									paymentInformation: {
										...nextSchema.fields.paymentInformation,
										fields: {
											...nextSchema.fields.paymentInformation.fields,
											provider: {
												...nextSchema.fields.paymentInformation.fields.provider,
												value: data.paymentInformation?.mobileMoneyProvider?.id,
											},
											code: {
												...nextSchema.fields.paymentInformation.fields.code,
												value: data.paymentInformation?.code,
											},
											phone: {
												...nextSchema.fields.paymentInformation.fields.phone,
												value: data.paymentInformation?.phone?.number,
											},
										},
									},
								},
							};

							if (updatedSchema.fields.program) {
								updatedSchema.fields.program = {
									...updatedSchema.fields.program,
									value: data.program?.id,
								};
							}
							if (updatedSchema.fields.localPartner) {
								updatedSchema.fields.localPartner = {
									...updatedSchema.fields.localPartner,
									value: data.localPartner.id,
								};
							}

							return updatedSchema;
						});
					},
					onError: (error) => onError?.(error),
				});
			});
		}
	}, [recipientId, sessionType, onError]);

	useEffect(() => {
		// load options for program, local partners, and supported mobile money providers
		startTransition(async () => {
			const [recipientOptionsResult, supportedProviders] = await Promise.all([
				getRecipientOptions(sessionType),
				getSupportedMobileMoneyProviderOptionsAction(sessionType),
			]);
			if (!recipientOptionsResult.success) {
				return;
			}
			const localPartner = recipientOptionsResult.data.localPartner;
			const programs = recipientOptionsResult.data.programs;
			const mobileMoneyProviders = supportedProviders.success ? supportedProviders.data : [];
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
