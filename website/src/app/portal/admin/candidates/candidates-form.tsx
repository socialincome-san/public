'use client';

import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import { getContactValuesFromPayload, getZodEnum } from '@/components/dynamic-form/helper';
import type { Session } from '@/lib/firebase/current-account';
import {
	createCandidateAction,
	deleteCandidateAction,
	getCandidateAction,
	getCandidateOptions,
	updateCandidateAction,
} from '@/lib/server-actions/candidate-actions';
import { getSupportedMobileMoneyProviderOptionsAction } from '@/lib/server-actions/mobile-money-provider-action';
import { CandidateCreateInput, CandidatePayload, CandidateUpdateInput } from '@/lib/services/candidate/candidate.types';
import { LocalPartnerOption } from '@/lib/services/local-partner/local-partner.types';
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

	const loadCandidate = async (candidateId: string) => {
		try {
			const result = await getCandidateAction(candidateId, sessionType);
			if (result.success) {
				setCandidate(result.data);
				const newSchema = { ...formSchema };
				const contactValues = getContactValuesFromPayload(result.data.contact, newSchema.fields.contact.fields);
				newSchema.fields.suspendedAt.value = result.data.suspendedAt;
				newSchema.fields.suspensionReason.value = result.data.suspensionReason;
				newSchema.fields.successorName.value = result.data.successorName;
				newSchema.fields.termsAccepted.value = result.data.termsAccepted;
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
			try {
				let result: { success: boolean; error?: string };
				const contactFields = schema.fields.contact.fields as { [key: string]: FormField };

				if (candidateId && candidate) {
					const data: CandidateUpdateInput = buildUpdateCandidateInput(schema, candidate, contactFields);
					const nextPaymentPhoneNumber = schema.fields.paymentInformation.fields.phone.value ?? null;
					result = await updateCandidateAction(data, nextPaymentPhoneNumber, sessionType);
				} else {
					const data: CandidateCreateInput = buildCreateCandidateInput(schema, contactFields);
					result = await createCandidateAction(data, sessionType);
				}

				result.success ? onSuccess?.() : onError?.(result.error);
			} catch (error: unknown) {
				onError?.(error);
			}
		});
	};

	const onDelete = () => {
		if (!candidateId) {
			return;
		}

		startTransition(async () => {
			try {
				const result = await deleteCandidateAction(candidateId, sessionType);
				result.success ? onSuccess?.() : onError?.(result.error);
			} catch (error) {
				onError?.(error);
			}
		});
	};

	useEffect(() => {
		if (candidateId) {
			startTransition(async () => await loadCandidate(candidateId));
		}
	}, [candidateId]);

	useEffect(() => {
		startTransition(async () => {
			const [{ localPartners }, supportedProviders] = await Promise.all([
				getCandidateOptions(sessionType),
				getSupportedMobileMoneyProviderOptionsAction(),
			]);
			if (!localPartners.success) {
				return;
			}
			setOptions(localPartners.data, supportedProviders.success ? supportedProviders.data : []);
		});
	}, [sessionType]);

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			onDelete={onDelete}
			mode={readOnly ? 'readonly' : candidateId ? 'edit' : 'add'}
		/>
	);
};
