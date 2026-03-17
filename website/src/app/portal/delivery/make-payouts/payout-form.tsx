'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema, getZodEnum } from '@/components/dynamic-form/helper';
import { PayoutStatus } from '@/generated/prisma/enums';
import {
	createPayoutAction,
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
	readOnly?: boolean;
};

export type PayoutFormSchema = {
	label: string;
	fields: {
		recipientId: FormField;
		amount: FormField;
		currency: FormField;
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

export const PayoutForm = ({ onSuccess, onError, onCancel, payoutId, readOnly }: PayoutFormProps) => {
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

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			mode={readOnly ? 'readonly' : payoutId ? 'edit' : 'add'}
		/>
	);
};
