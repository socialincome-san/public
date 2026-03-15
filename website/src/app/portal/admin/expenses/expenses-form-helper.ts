import { ExpenseFormCreateInput, ExpenseFormUpdateInput } from '@/lib/services/expense/expense-form-input';
import { ExpensePayload } from '@/lib/services/expense/expense.types';
import { ExpenseFormSchema } from './expenses-form';

export const buildCreateExpenseInput = (schema: ExpenseFormSchema): ExpenseFormCreateInput => {
	return {
		type: schema.fields.type.value,
		year: Number(schema.fields.year.value),
		amountChf: Number(schema.fields.amountChf.value),
		organizationId: `${schema.fields.organization.value ?? ''}`.trim(),
	};
};

export const buildUpdateExpenseInput = (
	schema: ExpenseFormSchema,
	existing: ExpensePayload,
): ExpenseFormUpdateInput => {
	return {
		id: existing.id,
		type: schema.fields.type.value,
		year: Number(schema.fields.year.value),
		amountChf: Number(schema.fields.amountChf.value),
		organizationId: `${schema.fields.organization.value ?? ''}`.trim(),
	};
};
