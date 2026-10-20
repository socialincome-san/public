'use client';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { clearFormSchemaValues, cloneFormSchema, getZodEnum } from '@/components/dynamic-form/helper';
import { ExpenseType } from '@/generated/prisma/enums';
import { handleResult } from '@/lib/result-client';
import {
	createExpenseAction,
	getExpenseAction,
	getExpenseOptionsAction,
	updateExpenseAction,
} from '@/modules/expenses/expense.actions';
import type { ExpensePayload } from '@/modules/expenses/expense.types';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, useTransition } from 'react';
import z from 'zod';
import { buildCreateExpenseInput, buildUpdateExpenseInput } from './expenses-form-helper';

type ExpenseFormProps = {
	onSuccess?: () => void;
	onError?: (error?: unknown) => void;
	onCancel?: () => void;
	expenseId?: string;
};

export type ExpenseFormSchema = {
	label: string;
	fields: {
		type: FormField;
		year: FormField;
		amountChf: FormField;
		organization: FormField;
	};
};

const getInitialFormSchema = (t: ReturnType<typeof useTranslations<'portal-admin'>>): ExpenseFormSchema => ({
	label: t('form.expense'),
	fields: {
		type: {
			placeholder: t('form.type'),
			label: t('form.type'),
			zodSchema: z.nativeEnum(ExpenseType),
			value: ExpenseType.staff,
			options: [
				{ id: ExpenseType.account_fees, label: t('expenseTypes.accountFees') },
				{ id: ExpenseType.administrative, label: t('expenseTypes.administrative') },
				{ id: ExpenseType.delivery_fees, label: t('expenseTypes.deliveryFees') },
				{ id: ExpenseType.donation_fees, label: t('expenseTypes.donationFees') },
				{ id: ExpenseType.exchange_rate_loss, label: t('expenseTypes.exchangeRateLoss') },
				{ id: ExpenseType.fundraising_advertising, label: t('expenseTypes.fundraisingAdvertising') },
				{ id: ExpenseType.staff, label: t('expenseTypes.staff') },
			],
		},
		year: {
			placeholder: t('form.year'),
			label: t('form.year'),
			zodSchema: z.coerce.number().int().min(2000, t('validation.yearRange')).max(2100, t('validation.yearRange')),
		},
		amountChf: {
			placeholder: t('form.amountChf'),
			label: t('form.amountChf'),
			zodSchema: z.coerce.number().min(0, t('validation.positiveAmount')),
		},
		organization: {
			placeholder: t('form.organization'),
			label: t('form.organization'),
		},
	},
});

export default function ExpensesForm({ onSuccess, onError, onCancel, expenseId }: ExpenseFormProps) {
	const t = useTranslations('portal-admin');
	const initialFormSchema = useMemo(() => getInitialFormSchema(t), [t]);
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(() => cloneFormSchema(initialFormSchema));
	const [expense, setExpense] = useState<ExpensePayload>();
	const [isLoading, startTransition] = useTransition();

	const loadExpense = async (id: string) => {
		const result = await getExpenseAction(id);
		handleResult(result, {
			onSuccess: (data) => {
				setExpense(data);
				setFormSchema((prev) => {
					const next = clearFormSchemaValues(prev);

					return {
						...next,
						fields: {
							...next.fields,
							type: { ...next.fields.type, value: data.type },
							year: { ...next.fields.year, value: data.year },
							amountChf: { ...next.fields.amountChf, value: data.amountChf },
							organization: { ...next.fields.organization, value: data.organization.id },
						},
					};
				});
			},
			onError: (error) => onError?.(error),
		});
	};

	const setOptions = (organizations: { id: string; name: string }[]) => {
		const optionsToZodEnum = (options: { id: string; name: string }[]) =>
			getZodEnum(options.map(({ id, name }) => ({ id, label: name })));

		const orgEnum = optionsToZodEnum(organizations);

		setFormSchema((prev) => ({
			...prev,
			fields: {
				...prev.fields,
				organization: {
					...prev.fields.organization,
					zodSchema: z.nativeEnum(orgEnum),
					value:
						prev.fields.organization.value ??
						(organizations.length > 0 ? organizations[0].id : prev.fields.organization.value),
				},
			},
		}));
	};

	const onSubmit = (schema: ExpenseFormSchema) => {
		startTransition(async () => {
			if (expenseId && expense?.id !== expenseId) {
				return onError?.(t('status.expenseLoading'));
			}
			const result =
				expenseId && expense
					? await updateExpenseAction(buildUpdateExpenseInput(schema, expense))
					: await createExpenseAction(buildCreateExpenseInput(schema));
			handleResult(result, {
				onSuccess: () => onSuccess?.(),
				onError: (error) => onError?.(error),
			});
		});
	};

	useEffect(() => {
		if (!expenseId) {
			return;
		}
		startTransition(async () => await loadExpense(expenseId));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [expenseId]);

	useEffect(() => {
		startTransition(async () => {
			const res = await getExpenseOptionsAction();
			if (!res.success) {
				return;
			}
			setOptions(res.data);
		});
	}, []);

	return (
		<DynamicForm
			formSchema={formSchema}
			isLoading={isLoading}
			onSubmit={onSubmit}
			onCancel={onCancel}
			mode={expenseId ? 'edit' : 'add'}
		/>
	);
}
