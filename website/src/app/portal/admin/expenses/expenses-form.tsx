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
		},
		year: {
			placeholder: 'Year',
			label: 'Year',
			zodSchema: z.coerce.number().int().min(2000).max(2100),
		},
		amountChf: {
			placeholder: 'Amount CHF',
			label: 'Amount CHF',
			zodSchema: z.coerce.number().nonnegative(),
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
		try {
			const result = await getExpenseAction(id);
			if (result.success) {
				setExpense(result.data);
				const next = { ...formSchema };
				next.fields.type.value = result.data.type;
				next.fields.year.value = result.data.year;
				next.fields.amountChf.value = result.data.amountChf;
				next.fields.organization.value = result.data.organization.id;
				setFormSchema(next);
			} else {
				onError?.(result.error);
			}
		} catch (e) {
			onError?.(e);
		}
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
				},
			},
		}));
	};

	const onSubmit = (schema: ExpenseFormSchema) => {
		startTransition(async () => {
			try {
				let res: { success: boolean; error?: string };
				if (expenseId && expense) {
					const data = buildUpdateExpenseInput(schema, expense);
					res = await updateExpenseAction(data);
				} else {
					const data = buildCreateExpenseInput(schema);
					res = await createExpenseAction(data);
				}
				res.success ? onSuccess?.() : onError?.(res.error);
			} catch (e) {
				onError?.(e);
			}
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
