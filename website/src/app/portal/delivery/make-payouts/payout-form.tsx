'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { getZodEnum } from '@/components/dynamic-form/helper';
import { PayoutStatus } from '@/generated/prisma/enums';
import {
	createPayoutAction,
	getPayoutAction,
	getPayoutRecipientOptionsAction,
	updatePayoutAction,
} from '@/lib/server-actions/payout-actions';
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
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(initialFormSchema);
	const [payout, setPayout] = useState<PayoutPayload>();
	const [isLoading, startTransition] = useTransition();

	useEffect(() => {
		if (!payoutId) {
			return;
		}

		startTransition(async () => {
			const result = await getPayoutAction(payoutId);
			if (!result.success) {
				return onError?.(result.error);
			}

			setPayout(result.data);

			const next = { ...formSchema };
			next.fields.recipientId.value = result.data.recipient.id;
			next.fields.amount.value = result.data.amount;
			next.fields.currency.value = result.data.currency;
			next.fields.phoneNumber.value = result.data.phoneNumber ?? undefined;
			next.fields.paymentAt.value = new Date(result.data.paymentAt);
			next.fields.status.value = result.data.status;

			setFormSchema(next);
		});
	}, [payoutId]);

	useEffect(() => {
		startTransition(async () => {
			const res = await getPayoutRecipientOptionsAction();
			if (!res.success) {
				return;
			}

			const recipientEnum = getZodEnum(res.data.map((r: RecipientOption) => ({ id: r.id, label: r.fullName })));

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
		});
	}, []);

	const onSubmit = (schema: PayoutFormSchema) => {
		startTransition(async () => {
			try {
				let res;

				if (payoutId && payout) {
					const data = buildUpdatePayoutInput(schema, payout);
					res = await updatePayoutAction(data);
				} else {
					const data = buildCreatePayoutInput(schema);
					res = await createPayoutAction(data);
				}

				res.success ? onSuccess?.() : onError?.(res.error);
			} catch (e) {
				onError?.(e);
			}
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
