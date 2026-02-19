import { ExpenseCreateInput, ExpensePayload, ExpenseUpdateInput } from '@/lib/services/expense/expense.types';
import { ExpenseFormSchema } from './expenses-form';

export const buildCreateExpenseInput = (schema: ExpenseFormSchema): ExpenseCreateInput => {
  return {
    type: schema.fields.type.value,
    year: Number(schema.fields.year.value),
    amountChf: Number(schema.fields.amountChf.value),
    organization: { connect: { id: schema.fields.organization.value } },
  };
};

export const buildUpdateExpenseInput = (schema: ExpenseFormSchema, existing: ExpensePayload): ExpenseUpdateInput => {
  return {
    id: existing.id,
    type: schema.fields.type.value,
    year: Number(schema.fields.year.value),
    amountChf: Number(schema.fields.amountChf.value),
    organization: { connect: { id: schema.fields.organization.value } },
  };
};
