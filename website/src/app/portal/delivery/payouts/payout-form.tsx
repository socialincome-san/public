'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema, getZodEnum } from '@/components/dynamic-form/helper';
import { PayoutStatus } from '@/generated/prisma/enums';
import {
	createPayoutAction,
	deletePayoutAction,
	getPayoutAction,
	getPayoutRecipientOptionsAction,
	updatePayoutAction,
} from '@/lib/server-actions/payout-actions';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import type { PayoutPayload } from '@/lib/services/payout/payout.types';
import type { RecipientOption } from '@/lib/services/recipient/recipient.types';
import { allCurrencies } from '@/lib/types/currency';
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

const initialFormSchema: PayoutFormSchema = {
	label: 'Payout',
	fields: {
		recipientId: {
			placeholder: 'Recipient',
			label: 'Recipient',
			useCombobox: true,
		},
		amount: {
			placeholder: 'Amount',
			label: 'Amount',
			zodSchema: z.coerce.number().nonnegative(),
		},
		currency: {
			placeholder: 'Select currency',
			label: 'Currency Code',
			useCombobox: true,
			zodSchema: z.nativeEnum(getZodEnum(allCurrencies.map((c) => ({ id: c, label: c })))),
		},
		amountChf: {
			placeholder: 'Amount in CHF',
			label: 'Amount (CHF)',
			zodSchema: z.coerce.number().nonnegative('CHF amount must be non-negative.').optional(),
		},
		phoneNumber: {
			placeholder: '+223...',
			label: 'Phone Number',
			zodSchema: z.string().optional(),
		},
		paymentAt: {
			label: 'Payment Date',
			zodSchema: z.date(),
		},
		status: {
			label: 'Status',
			zodSchema: z.nativeEnum(PayoutStatus),
		},
	},
};

export const PayoutForm = ({ onSuccess, onError, onCancel, payoutId }: PayoutFormProps) => {
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [payout, setPayout] = useState<PayoutPayload>();
	const [isLoading, startTransition] = useTransition();

	useEffect(() => {
		if (!payoutId) {
			return;
		}

		startTransition(async () => {
			const result = await getPayoutAction(payoutId);
			handleServiceResult(result, {
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
			handleServiceResult(res, {
				onSuccess: (data) => {
					const recipientEnum = getZodEnum(data.map((r: RecipientOption) => ({ id: r.id, label: r.fullName })));

					setFormSchema((prev) => ({
						...prev,
						fields: {
							...prev.fields,
							recipientId: {
								...prev.fields.recipientId,
								zodSchema: z.nativeEnum(recipientEnum),
							},
						},
					}));
				},
				onError: (error) => onError?.(error),
			});
		});
	}, [onError]);

	const onSubmit = (schema: PayoutFormSchema) => {
		startTransition(async () => {
			const res =
				payoutId && payout
					? await updatePayoutAction(buildUpdatePayoutInput(schema, payout))
					: await createPayoutAction(buildCreatePayoutInput(schema));
			handleServiceResult(res, {
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
						handleServiceResult(res, {
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
