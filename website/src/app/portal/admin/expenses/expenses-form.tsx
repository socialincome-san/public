'use client';

import DynamicForm, { FormField } from '@/components/dynamic-form/dynamic-form';
import { getZodEnum } from '@/components/dynamic-form/helper';
import { ExpenseType } from '@/generated/prisma/enums';
import {
	createExpenseAction,
	getExpenseAction,
	getExpenseOptionsAction,
	updateExpenseAction,
} from '@/lib/server-actions/expense-action';
import { handleServiceResult } from '@/lib/services/core/service-result-client';
import { ExpensePayload } from '@/lib/services/expense/expense.types';
import { useEffect, useState, useTransition } from 'react';
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

const initialFormSchema: ExpenseFormSchema = {
	label: 'Expense',
	fields: {
		type: {
			placeholder: 'Type',
			label: 'Type',
			zodSchema: z.nativeEnum(ExpenseType),
			value: ExpenseType.staff,
		},
		year: {
			placeholder: 'Year',
			label: 'Year',
			zodSchema: z.coerce
				.number()
				.int()
				.min(2000, 'Year must be between 2000 and 2100.')
				.max(2100, 'Year must be between 2000 and 2100.'),
		},
		amountChf: {
			placeholder: 'Amount CHF',
			label: 'Amount CHF',
			zodSchema: z.coerce.number().min(0, 'Amount CHF must be zero or greater.'),
		},
		organization: {
			placeholder: 'Organization',
			label: 'Organization',
		},
	},
};

export default function ExpensesForm({ onSuccess, onError, onCancel, expenseId }: ExpenseFormProps) {
	const [formSchema, setFormSchema] = useState<typeof initialFormSchema>(initialFormSchema);
	const [expense, setExpense] = useState<ExpensePayload>();
	const [isLoading, startTransition] = useTransition();

	const loadExpense = async (id: string) => {
		const result = await getExpenseAction(id);
		handleServiceResult(result, {
			onSuccess: (data) => {
				setExpense(data);
				setFormSchema((prev) => ({
					...prev,
					fields: {
						...prev.fields,
						type: { ...prev.fields.type, value: data.type },
						year: { ...prev.fields.year, value: data.year },
						amountChf: { ...prev.fields.amountChf, value: data.amountChf },
						organization: { ...prev.fields.organization, value: data.organization.id },
					},
				}));
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
			if (expenseId && (!expense || expense.id !== expenseId)) {
				return onError?.('Expense is still loading. Please try again.');
			}
			const result =
				expenseId && expense
					? await updateExpenseAction(buildUpdateExpenseInput(schema, expense))
					: await createExpenseAction(buildCreateExpenseInput(schema));
			handleServiceResult(result, {
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
