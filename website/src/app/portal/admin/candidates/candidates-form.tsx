'use client';

import { getFormSchema as getContactFormSchema } from '@/components/dynamic-form/contact-form-schemas';
import DynamicForm, { FormField, FormSchema } from '@/components/dynamic-form/dynamic-form';
import {
	clearFormSchemaValues,
	getContactValuesFromPayload,
	getOptionalDropdownFieldConfig,
	getZodEnum,
} from '@/components/dynamic-form/helper';
import { usePortalSharedTranslations } from '@/components/portal-shared-translations';
import { handleResult } from '@/lib/result-client';
import { E164_OPTIONAL_PHONE_REGEX } from '@/lib/utils/regex';
import type { Session } from '@/modules/auth/auth.types';
import {
	createCandidateAction,
	deleteCandidateAction,
	getCandidateAction,
	getCandidateOptionsAction,
	updateCandidateAction,
} from '@/modules/candidates/candidate.actions';
import type { CandidatePayload } from '@/modules/candidates/candidate.types';
import type { LocalPartnerOption } from '@/modules/local-partners/local-partner.types';
import { getSupportedMobileMoneyProviderOptionsAction } from '@/modules/mobile-money-providers/mobile-money-provider.actions';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateCandidateInput, buildUpdateCandidateInput } from './candidate-form-helpers';

type CandidateFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
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

const getInitialFormSchema = (
	t: ReturnType<typeof useTranslations<'portal-admin'>>,
	sharedTranslate: ReturnType<typeof usePortalSharedTranslations>['t'],
	sessionType: Session['type'] = 'user',
): CandidateFormSchema => {
	const base: CandidateFormSchema = {
		label: t('form.candidates'),
		fields: {
			suspendedAt: {
				label: t('form.suspendedAt'),
				zodSchema: z.date().min(new Date('2020-01-01')).max(new Date('2050-12-31')).nullable().optional(),
			},
			suspensionReason: {
				label: t('form.suspensionReason'),
				zodSchema: z.string().nullable().optional(),
			},
			successorName: {
				placeholder: t('form.successor'),
				label: t('form.successor'),
				zodSchema: z.string().nullable(),
			},
			termsAccepted: {
				label: t('form.termsAccepted'),
				zodSchema: z.boolean().optional(),
			},
			localPartner: {
				placeholder: t('form.localPartner'),
				label: t('form.localPartner'),
			},
			paymentInformation: {
				label: t('form.paymentInformation'),
				fields: {
					provider: {
						placeholder: t('form.provider'),
						label: t('form.provider'),
						zodSchema: z.string().optional(),
					},
					code: {
						placeholder: t('form.code'),
						label: t('form.code'),
						zodSchema: z.string().nullable(),
					},
					phone: {
						placeholder: t('form.phoneNumber'),
						label: t('form.phoneNumber'),
						zodSchema: z.string().regex(E164_OPTIONAL_PHONE_REGEX, t('validation.phoneNumber')).optional(),
					},
				},
			},
			contact: {
				...getContactFormSchema({ translate: sharedTranslate }),
			},
		},
	};

	if (sessionType === 'local-partner') {
		delete base.fields.localPartner;
	}

	return base;
};

export const CandidateForm = ({ onSuccess, onError, onCancel, candidateId, sessionType = 'user' }: CandidateFormProps) => {
	const t = useTranslations('portal-admin');
	const { t: sharedTranslate } = usePortalSharedTranslations();
	const initialFormSchema = useMemo(
		() => getInitialFormSchema(t, sharedTranslate, sessionType),
		[sessionType, sharedTranslate, t],
	);
	const [formSchema, setFormSchema] = useState(() => initialFormSchema);
	const [candidate, setCandidate] = useState<CandidatePayload>();
	const [isLoading, startTransition] = useTransition();

	const setOptions = (localPartner: LocalPartnerOption[], mobileMoneyProviders: { id: string; name: string }[]) => {
		const partnersObj = getZodEnum(localPartner.map(({ id, name }) => ({ id, label: name })));
		const providerFieldConfig = getOptionalDropdownFieldConfig(
			mobileMoneyProviders.map((p) => ({ id: p.id, label: p.name })),
		);

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
							...providerFieldConfig,
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
			handleResult(result, {
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
			handleResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	useEffect(() => {
		if (candidateId) {
			startTransition(async () => {
				const result = await getCandidateAction(candidateId, sessionType);
				handleResult(result, {
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
				getCandidateOptionsAction(sessionType),
				getSupportedMobileMoneyProviderOptionsAction(sessionType),
			]);
			if (!candidateOptionsResult.success) {
				return;
			}
			setOptions(candidateOptionsResult.data.localPartners, supportedProviders.success ? supportedProviders.data : []);
		});
	}, [sessionType]);

	const mode = candidateId ? 'edit' : 'add';

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
