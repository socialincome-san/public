'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import type { ExpenseCreateInput, ExpenseUpdateInput } from '@/lib/services/expense/expense.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/expenses';

export const createExpenseAction = async (input: ExpenseCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.expense.create(sessionResult.data.id, input);
	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const updateExpenseAction = async (input: ExpenseUpdateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.expense.update(sessionResult.data.id, input);
	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const getExpenseAction = async (id: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.read.expense.get(sessionResult.data.id, id);
};

export const getExpenseOptionsAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.read.organization.getOptions(sessionResult.data.id);
};
