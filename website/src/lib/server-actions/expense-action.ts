'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ExpenseService } from '@/lib/services/expense/expense.service';
import type { ExpenseCreateInput, ExpenseUpdateInput } from '@/lib/services/expense/expense.types';
import { OrganizationService } from '@/lib/services/organization/organization.service';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/expenses';

export const createExpenseAction = async (input: ExpenseCreateInput) => {
  const user = await getAuthenticatedUserOrRedirect();

  const service = new ExpenseService();
  const res = await service.create(user.id, input);

  revalidatePath(REVALIDATE_PATH);

  return res;
};

export const updateExpenseAction = async (input: ExpenseUpdateInput) => {
  const user = await getAuthenticatedUserOrRedirect();

  const service = new ExpenseService();
  const res = await service.update(user.id, input);

  revalidatePath(REVALIDATE_PATH);

  return res;
};

export const getExpenseAction = async (id: string) => {
  const user = await getAuthenticatedUserOrRedirect();

  const service = new ExpenseService();

  return service.get(user.id, id);
};

export const getExpenseOptionsAction = async () => {
  const user = await getAuthenticatedUserOrRedirect();

  const service = new OrganizationService();

  return service.getOptions(user.id);
};
