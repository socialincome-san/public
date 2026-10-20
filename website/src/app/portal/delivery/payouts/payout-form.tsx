'use client';

import { usePortalOperationsTranslations } from '@/app/portal/portal-operations-translations';
import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema, getZodEnum } from '@/components/dynamic-form/helper';
import { PayoutStatus } from '@/generated/prisma/enums';
import { handleResult } from '@/lib/result-client';
import { allCurrencies } from '@/lib/types/currency';
import {
	createPayoutAction,
	deletePayoutAction,
	getPayoutAction,
	getPayoutRecipientOptionsAction,
	updatePayoutAction,
} from '@/modules/payouts/payout.actions';
import type { PayoutPayload } from '@/modules/payouts/payout.types';
import type { RecipientOption } from '@/modules/recipients/recipient.types';
import { useEffect, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreatePayoutInput, buildUpdatePayoutInput } from './payout-form-helpers';

type PayoutFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	payoutId?: string;
};

export type PayoutFormSchema = {
	label: string;
	fields: {
		recipientId: FormField;
		amount: FormField;
		currency: FormField;
		amountChf: FormField;
		phoneNumber: FormField;
		paymentAt: FormField;
		status: FormField;
	};
};

export const PayoutForm = ({ onSuccess, onError, onCancel, payoutId }: PayoutFormProps) => {
	const t = usePortalOperationsTranslations();
	const initialFormSchema: PayoutFormSchema = {
		label: t('delivery.payout_form.title'),
		fields: {
			recipientId: {
				placeholder: t('delivery.payout_form.recipient'),
				label: t('delivery.payout_form.recipient'),
				useCombobox: true,
			},
			amount: {
				placeholder: t('delivery.payout_form.amount'),
				label: t('delivery.payout_form.amount'),
				zodSchema: z.coerce
					.number({ invalid_type_error: t('delivery.payout_form.invalid_number') })
					.nonnegative(t('delivery.payout_form.amount_nonnegative')),
			},
			currency: {
				placeholder: t('delivery.payout_form.select_currency'),
				label: t('delivery.payout_form.currency_code'),
				useCombobox: true,
				zodSchema: z.nativeEnum(getZodEnum(allCurrencies.map((c) => ({ id: c, label: c }))), {
					errorMap: () => ({ message: t('delivery.payout_form.currency_invalid') }),
				}),
			},
			amountChf: {
				placeholder: t('delivery.payout_form.amount_chf'),
				label: t('delivery.payout_form.amount_chf'),
				zodSchema: z.coerce
					.number({ invalid_type_error: t('delivery.payout_form.invalid_number') })
					.nonnegative(t('delivery.payout_form.chf_amount_nonnegative'))
					.optional(),
			},
			phoneNumber: {
				placeholder: '+223...',
				label: t('delivery.payout_form.phone_number'),
				zodSchema: z.string().optional(),
			},
			paymentAt: {
				label: t('delivery.payout_form.payment_date'),
				zodSchema: z.date({ invalid_type_error: t('delivery.payout_form.payment_date_invalid') }),
			},
			status: {
				label: t('delivery.payout_form.status'),
				zodSchema: z.nativeEnum(PayoutStatus, {
					errorMap: () => ({ message: t('delivery.payout_form.status_invalid') }),
				}),
			},
		},
	};
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [payout, setPayout] = useState<PayoutPayload>();
	const [isLoading, startTransition] = useTransition();

	useEffect(() => {
		if (!payoutId) {
			return;
		}

		startTransition(async () => {
			const result = await getPayoutAction(payoutId);
			handleResult(result, {
				onSuccess: (data) => {
					setPayout(data);
					setFormSchema((prev) => {
						const next = clearFormSchemaValues(prev);

						return {
							...next,
							fields: {
								...next.fields,
								recipientId: { ...next.fields.recipientId, value: data.recipient.id },
								amount: { ...next.fields.amount, value: data.amount },
								amountChf: { ...next.fields.amountChf, value: data.amountChf ?? undefined },
								currency: { ...next.fields.currency, value: data.currency },
								phoneNumber: { ...next.fields.phoneNumber, value: data.phoneNumber ?? undefined },
								paymentAt: { ...next.fields.paymentAt, value: new Date(data.paymentAt) },
								status: { ...next.fields.status, value: data.status },
							},
						};
					});
				},
				onError: (error) => onError?.(error),
			});
		});
	}, [onError, payoutId]);

	useEffect(() => {
		startTransition(async () => {
			const res = await getPayoutRecipientOptionsAction();
			handleResult(res, {
				onSuccess: (data) => {
					const recipientEnum = getZodEnum(data.map((r: RecipientOption) => ({ id: r.id, label: r.fullName })));

					setFormSchema((prev) => ({
						...prev,
						fields: {
							...prev.fields,
							recipientId: {
								...prev.fields.recipientId,
								zodSchema: z.nativeEnum(recipientEnum, {
									errorMap: () => ({ message: t('delivery.payout_form.recipient_invalid') }),
								}),
							},
						},
					}));
				},
				onError: (error) => onError?.(error),
			});
		});
	}, [onError, t]);

	const onSubmit = (schema: PayoutFormSchema) => {
		startTransition(async () => {
			const res =
				payoutId && payout
					? await updatePayoutAction(buildUpdatePayoutInput(schema, payout))
					: await createPayoutAction(buildCreatePayoutInput(schema));
			handleResult(res, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	const onDelete =
		payoutId && payout?.status === PayoutStatus.failed
			? () => {
					startTransition(async () => {
						const res = await deletePayoutAction(payoutId);
						handleResult(res, {
							onSuccess: () => onSuccess?.(),
							onError: (error) => onError?.(error),
						});
					});
				}
			: undefined;

	const mode = payoutId ? 'edit' : 'add';

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
