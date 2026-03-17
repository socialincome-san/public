'use client';

import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, getContactValuesFromPayload, getZodEnum } from '@/components/dynamic-form/helper';
import type { Session } from '@/lib/firebase/current-account';
import {
	createCandidateAction,
	deleteCandidateAction,
	getCandidateAction,
	getCandidateOptions,
	updateCandidateAction,
} from '@/lib/server-actions/candidate-actions';
import { getSupportedMobileMoneyProviderOptionsAction } from '@/lib/server-actions/mobile-money-provider-action';
import { CandidatePayload } from '@/lib/services/candidate/candidate.types';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import { LocalPartnerOption } from '@/lib/services/local-partner/local-partner.types';
import { E164_OPTIONAL_PHONE_REGEX } from '@/lib/utils/regex';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateCandidateInput, buildUpdateCandidateInput } from './candidate-form-helpers';

type CandidateFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	readOnly?: boolean;
	candidateId?: string;
	sessionType?: Session['type'];
};

export type CandidateFormSchema = {
	label: string;
	fields: {
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
		localPartner?: FormField;
		contact: FormSchema;
	};
};

const getInitialFormSchema = (sessionType: Session['type'] = 'user'): CandidateFormSchema => {
	const base: CandidateFormSchema = {
		label: 'Candidates',
		fields: {
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
							.regex(E164_OPTIONAL_PHONE_REGEX, 'Phone number must be empty or in valid E.164 format (e.g., +12345678901)')
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
		delete base.fields.localPartner;
	}

	return base;
};

export const CandidateForm = ({
	onSuccess,
	onError,
	onCancel,
	candidateId,
	readOnly,
	sessionType = 'user',
}: CandidateFormProps) => {
	const [formSchema, setFormSchema] = useState(() => getInitialFormSchema(sessionType));
	const [candidate, setCandidate] = useState<CandidatePayload>();
	const [isLoading, startTransition] = useTransition();

	const setOptions = (localPartner: LocalPartnerOption[], mobileMoneyProviders: { id: string; name: string }[]) => {
		const partnersObj = getZodEnum(localPartner.map(({ id, name }) => ({ id, label: name })));
		const providerOptions = mobileMoneyProviders.map((p) => ({ id: p.id, label: p.name }));
		const providerEnum = getZodEnum(providerOptions);

		setFormSchema((prev) => ({
			...prev,
			fields: {
				...prev.fields,
				...(prev.fields.localPartner && {
					localPartner: {
						...prev.fields.localPartner,
						zodSchema: z.nativeEnum(partnersObj),
					},
				}),
				paymentInformation: {
					...prev.fields.paymentInformation,
					fields: {
						...prev.fields.paymentInformation.fields,
						provider: {
							...prev.fields.paymentInformation.fields.provider,
							options: providerOptions,
							zodSchema: providerOptions.length > 0 ? z.nativeEnum(providerEnum) : z.string().optional(),
						},
					},
				},
			},
		}));
	};

	const onSubmit = (schema: CandidateFormSchema) => {
		startTransition(async () => {
			const contactFields = schema.fields.contact.fields as Record<string, FormField>;
			const result =
				candidateId && candidate
					? await updateCandidateAction(buildUpdateCandidateInput(schema, candidate, contactFields), sessionType)
					: await createCandidateAction(buildCreateCandidateInput(schema, contactFields), sessionType);
			handleServiceResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	const onDelete = () => {
		if (!candidateId) {
			return;
		}

		startTransition(async () => {
			const result = await deleteCandidateAction(candidateId, sessionType);
			handleServiceResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	useEffect(() => {
		if (candidateId) {
			startTransition(async () => {
				const result = await getCandidateAction(candidateId, sessionType);
				handleServiceResult(result, {
					onSuccess: (data) => {
						setCandidate(data);
						setFormSchema((previousSchema) => {
							const nextSchema = clearFormSchemaValues(previousSchema);
							const clonedContactFields = Object.fromEntries(
								Object.entries(nextSchema.fields.contact.fields).map(([key, field]) => [key, { ...field }]),
							);
							const contactValues = getContactValuesFromPayload(data.contact, clonedContactFields);
							const updatedSchema: CandidateFormSchema = {
								...nextSchema,
								fields: {
									...nextSchema.fields,
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
	}, [candidateId, sessionType, onError]);

	useEffect(() => {
		startTransition(async () => {
			const [candidateOptionsResult, supportedProviders] = await Promise.all([
				getCandidateOptions(sessionType),
				getSupportedMobileMoneyProviderOptionsAction(sessionType),
			]);
			if (!candidateOptionsResult.success) {
				return;
			}
			setOptions(candidateOptionsResult.data.localPartners, supportedProviders.success ? supportedProviders.data : []);
		});
	}, [sessionType]);

	let mode: 'readonly' | 'edit' | 'add' = 'add';
	if (readOnly) {
		mode = 'readonly';
	} else if (candidateId) {
		mode = 'edit';
	}

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			onDelete={onDelete}
			mode={mode}
		/>
	);
};
