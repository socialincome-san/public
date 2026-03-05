'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ExpenseReadService } from '@/lib/services/expense/expense-read.service';
import { ExpenseWriteService } from '@/lib/services/expense/expense-write.service';
import type { ExpenseCreateInput, ExpenseUpdateInput } from '@/lib/services/expense/expense.types';
import { OrganizationReadService } from '@/lib/services/organization/organization-read.service';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/expenses';

export const createExpenseAction = async (input: ExpenseCreateInput) => {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ExpenseWriteService();
	const res = await service.create(user.id, input);

	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const updateExpenseAction = async (input: ExpenseUpdateInput) => {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ExpenseWriteService();
	const res = await service.update(user.id, input);

	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const getExpenseAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ExpenseReadService();
	return service.get(user.id, id);
};

export const getExpenseOptionsAction = async () => {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new OrganizationReadService();
	return service.getOptions(user.id);
};
