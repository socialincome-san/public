'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ExpenseService } from '@socialincome/shared/src/database/services/expense/expense.service';
import type {
	ExpenseCreateInput,
	ExpenseUpdateInput,
} from '@socialincome/shared/src/database/services/expense/expense.types';
import { OrganizationService } from '@socialincome/shared/src/database/services/organization/organization.service';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/expenses';

export async function createExpenseAction(input: ExpenseCreateInput) {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ExpenseService();
	const res = await service.create(user.id, input);

	revalidatePath(REVALIDATE_PATH);
	return res;
}

export async function updateExpenseAction(input: ExpenseUpdateInput) {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ExpenseService();
	const res = await service.update(user.id, input);

	revalidatePath(REVALIDATE_PATH);
	return res;
}

export async function getExpenseAction(id: string) {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ExpenseService();
	return service.get(user.id, id);
}

export async function getExpenseOptionsAction() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new OrganizationService();
	return service.getOptions(user.id);
}
