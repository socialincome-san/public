'use client';

import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import {
	clearFormSchemaValues,
	getContactValuesFromPayload,
	getOptionalDropdownFieldConfig,
	getZodEnum,
} from '@/components/dynamic-form/helper';
import { usePortalSharedTranslations, type PortalSharedTranslate } from '@/components/portal-shared-translations';
import { handleResult } from '@/lib/result-client';
import { E164_OPTIONAL_PHONE_REGEX } from '@/lib/utils/regex';
import type { Session } from '@/modules/auth/auth.types';
import type { LocalPartnerOption } from '@/modules/local-partners/local-partner.types';
import { getSupportedMobileMoneyProviderOptionsAction } from '@/modules/mobile-money-providers/mobile-money-provider.actions';
import type { ProgramOption } from '@/modules/programs/program.types';
import {
	createRecipientAction,
	deleteRecipientAction,
	getRecipientAction,
	getRecipientOptionsAction,
	removeRecipientFromProgramAction,
	updateRecipientAction,
} from '@/modules/recipients/recipient.actions';
import type { RecipientPayload } from '@/modules/recipients/recipient.types';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateRecipientInput, buildUpdateRecipientInput } from './recipient-form-helpers';

type RecipientFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
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

const getInitialFormSchema = (t: PortalSharedTranslate, sessionType: Session['type'] = 'user'): RecipientFormSchema => {
	const base: RecipientFormSchema = {
		label: t('form.recipientsSection', 'Recipients'),
		fields: {
			startDate: {
				label: t('form.startDate', 'Start Date'),
				zodSchema: z.date().min(new Date('2020-01-01')).max(new Date('2050-12-31')).nullable().optional(),
			},
			suspendedAt: {
				label: t('form.suspendedAt', 'Suspended At'),
				zodSchema: z.date().min(new Date('2020-01-01')).max(new Date('2050-12-31')).nullable().optional(),
			},
			suspensionReason: {
				label: t('form.suspensionReason', 'Suspension Reason'),
				zodSchema: z.string().nullable().optional(),
			},
			successorName: {
				placeholder: t('form.successor', 'Successor'),
				label: t('form.successor', 'Successor'),
				zodSchema: z.string().nullable(),
			},
			termsAccepted: {
				label: t('form.termsAccepted', 'Terms Accepted'),
				zodSchema: z.boolean().optional(),
			},
			program: {
				placeholder: t('form.program', 'Program'),
				label: t('form.program', 'Program'),
			},
			localPartner: {
				placeholder: t('form.localPartner', 'Local Partner'),
				label: t('form.localPartner', 'Local Partner'),
			},
			paymentInformation: {
				label: t('form.paymentInformation', 'Payment Information'),
				fields: {
					provider: {
						placeholder: t('form.provider', 'Provider'),
						label: t('form.provider', 'Provider'),
						zodSchema: z.string().optional(),
					},
					code: {
						placeholder: t('form.code', 'Code'),
						label: t('form.code', 'Code'),
						zodSchema: z.string().nullable(),
					},
					phone: {
						placeholder: t('form.phoneNumber', 'Phone Number'),
						label: t('form.phoneNumber', 'Phone Number'),
						zodSchema: z
							.string()
							.regex(
								E164_OPTIONAL_PHONE_REGEX,
								t('validation.phoneFormat', 'Phone number must be empty or in valid E.164 format (e.g., +12345678901)'),
							)
							.optional(),
					},
				},
			},
			contact: getContactFormSchema({ translate: t }),
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
	programId,
	sessionType = 'user',
}: RecipientFormProps) => {
	const { t } = usePortalSharedTranslations();
	const [formSchema, setFormSchema] = useState(() => getInitialFormSchema(t, sessionType));
	const [recipient, setRecipient] = useState<RecipientPayload>();
	const [isLoading, startTransition] = useTransition();

	const onSubmit = (schema: RecipientFormSchema) => {
		startTransition(async () => {
			if (recipientId && recipient?.id !== recipientId) {
				return onError?.(t('validation.recipientLoading', 'Recipient is still loading. Please try again.'));
			}
			const contactFields = schema.fields.contact.fields as Record<string, FormField>;
			const result =
				recipientId && recipient
					? await updateRecipientAction(buildUpdateRecipientInput(schema, recipient, contactFields), sessionType)
					: await createRecipientAction(buildCreateRecipientInput(schema, contactFields), sessionType);

			handleResult(result, {
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
			handleResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	const onRemoveFromProgram = () => {
		if (!recipientId) {
			return;
		}

		startTransition(async () => {
			const result = await removeRecipientFromProgramAction(recipientId, sessionType);
			handleResult(result, {
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
				handleResult(result, {
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
				getRecipientOptionsAction(sessionType),
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
			const providerFieldConfig = getOptionalDropdownFieldConfig(
				mobileMoneyProviders.map((p) => ({ id: p.id, label: p.name })),
			);

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
							...providerFieldConfig,
						},
					},
				};

				return updated;
			});
		});
	}, [sessionType, programId]);

	const mode = recipientId ? 'edit' : 'add';
	const extraAction =
		recipient?.program && sessionType === 'user'
			? {
					label: t('form.removeFromProgram', 'Remove from program'),
					confirmTitle: t('form.removeFromProgramTitle', 'Remove from program?'),
					confirmDescription: t(
						'form.removeFromProgramDescription',
						'The recipient stays in the pool and can be reassigned to a program later. This is only possible for recipients without payouts.',
					),
					onConfirm: onRemoveFromProgram,
				}
			: undefined;

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			onDelete={onDelete}
			extraAction={extraAction}
			mode={mode}
		/>
	);
};
