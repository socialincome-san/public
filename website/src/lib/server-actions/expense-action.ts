'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { ExpenseCreateInput, ExpenseUpdateInput } from '@/lib/services/expense/expense.types';
import { getServices } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/expenses';

export const createExpenseAction = async (input: ExpenseCreateInput) => {
	const user = await getAuthenticatedUserOrRedirect();
	const res = await getServices().expenseWrite.create(user.id, input);
	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const updateExpenseAction = async (input: ExpenseUpdateInput) => {
	const user = await getAuthenticatedUserOrRedirect();
	const res = await getServices().expenseWrite.update(user.id, input);
	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const getExpenseAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();
	return getServices().expenseRead.get(user.id, id);
};

export const getExpenseOptionsAction = async () => {
	const user = await getAuthenticatedUserOrRedirect();
	return getServices().organizationRead.getOptions(user.id);
};
