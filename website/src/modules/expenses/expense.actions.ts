'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail } from '@/lib/service-result';
import { expenseCreateInputSchema, expenseIdSchema, expenseUpdateInputSchema } from '@/modules/expenses/expense.schemas';
import { createExpense, getExpense, getExpenseOptions, updateExpense } from '@/modules/expenses/expense.service';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/expenses';

export const createExpenseAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = expenseCreateInputSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	const result = await createExpense(sessionResult.data.id, parsedInput.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const updateExpenseAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = expenseUpdateInputSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	const result = await updateExpense(sessionResult.data.id, parsedInput.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getExpenseAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = expenseIdSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	return getExpense(sessionResult.data.id, parsedInput.data);
};

export const getExpenseOptionsAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getExpenseOptions(sessionResult.data.id);
};
