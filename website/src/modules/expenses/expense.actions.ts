'use server';

import { resultFail, type Result } from '@/lib/result';
import { getSessionByType } from '@/modules/auth/session.service';
import {
	expenseCreateInputSchema,
	expenseIdSchema,
	expenseTableQuerySchema,
	expenseUpdateInputSchema,
} from '@/modules/expenses/expense.schemas';
import {
	createExpense,
	getExpense,
	getExpenseOptions,
	getPaginatedExpenseTableView,
	updateExpense,
} from '@/modules/expenses/expense.service';
import type { ExpensePaginatedTableView, ExpensePayload } from '@/modules/expenses/expense.types';
import type { OrganizationOption } from '@/modules/organizations/organization.types';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/expenses';

export const getExpenseTableViewAction = async (query: unknown): Promise<Result<ExpensePaginatedTableView>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedQuery = expenseTableQuerySchema.safeParse(query);

	return parsedQuery.success
		? getPaginatedExpenseTableView(sessionResult.data.id, parsedQuery.data)
		: resultFail('Invalid expense query.');
};

export const createExpenseAction = async (input: unknown): Promise<Result<ExpensePayload>> => {
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

export const updateExpenseAction = async (input: unknown): Promise<Result<ExpensePayload>> => {
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

export const getExpenseAction = async (input: unknown): Promise<Result<ExpensePayload>> => {
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

export const getExpenseOptionsAction = async (): Promise<Result<OrganizationOption[]>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return getExpenseOptions(sessionResult.data.id);
};
