/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { ExpenseCreateInput, ExpenseUpdateInput } from '@/modules/expenses/expense.schemas';
import type { ExpensePayload } from '@/modules/expenses/expense.types';
import { ExpenseFormSchema } from './expenses-form';

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

export const buildCreateExpenseInput = (schema: ExpenseFormSchema): ExpenseCreateInput => {
	return {
		type: schema.fields.type.value,
		year: Number(schema.fields.year.value),
		amountChf: Number(schema.fields.amountChf.value),
		organizationId: asString(schema.fields.organization.value).trim(),
	};
};

export const buildUpdateExpenseInput = (schema: ExpenseFormSchema, existing: ExpensePayload): ExpenseUpdateInput => {
	return {
		id: existing.id,
		type: schema.fields.type.value,
		year: Number(schema.fields.year.value),
		amountChf: Number(schema.fields.amountChf.value),
		organizationId: asString(schema.fields.organization.value).trim(),
	};
};
