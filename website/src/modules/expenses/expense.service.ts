import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { getOrganization, getOrganizationOptions } from '@/modules/organizations/organization.service';
import type { OrganizationOption } from '@/modules/organizations/organization.types';
import { isAdmin } from '@/modules/users/user.service';
import * as expenseRepository from './expense.repository';
import type { ExpenseCreateInput, ExpenseUpdateInput } from './expense.schemas';
import type { ExpensePaginatedTableView, ExpensePayload, ExpenseTableQuery } from './expense.types';

type ExpenseRecord = NonNullable<Awaited<ReturnType<typeof expenseRepository.findExpenseById>>>;

export const getExpense = async (userId: string, expenseId: string): Promise<ServiceResult<ExpensePayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const expense = await expenseRepository.findExpenseById(expenseId);

		return expense ? resultOk(toExpensePayload(expense)) : resultFail('Could not get expense');
	} catch (error) {
		console.error('Could not get expense', { expenseId, error });

		return resultFail('Could not get expense');
	}
};

export const getPaginatedExpenseTableView = async (
	userId: string,
	query: ExpenseTableQuery,
): Promise<ServiceResult<ExpensePaginatedTableView>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const { expenses, totalCount } = await expenseRepository.findPaginatedExpenses(query);

		return resultOk({
			tableRows: expenses.map((expense) => ({
				id: expense.id,
				type: expense.type,
				year: expense.year,
				amountChf: Number(expense.amountChf),
				organizationName: expense.organization.name,
				createdAt: expense.createdAt,
			})),
			totalCount,
		});
	} catch (error) {
		console.error('Could not fetch expenses', { userId, error });

		return resultFail('Could not fetch expenses');
	}
};

export const getExpenseOptions = async (userId: string): Promise<ServiceResult<OrganizationOption[]>> =>
	getOrganizationOptions(userId);

export const createExpense = async (userId: string, input: ExpenseCreateInput): Promise<ServiceResult<ExpensePayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const organizationResult = await getOrganization(userId, input.organizationId);
		if (!organizationResult.success) {
			return resultFail(
				organizationResult.error === 'Organization not found' ? 'Organization not found.' : organizationResult.error,
			);
		}

		return resultOk(toExpensePayload(await expenseRepository.createExpense(input)));
	} catch (error) {
		console.error('Could not create expense', { error });

		return resultFail('Could not create expense. Please try again later.');
	}
};

export const updateExpense = async (userId: string, input: ExpenseUpdateInput): Promise<ServiceResult<ExpensePayload>> => {
	try {
		const isAdminResult = await isAdmin(userId);
		if (!isAdminResult.success) {
			return resultFail(isAdminResult.error);
		}

		const organizationResult = await getOrganization(userId, input.organizationId);
		if (!organizationResult.success) {
			return resultFail(
				organizationResult.error === 'Organization not found' ? 'Organization not found.' : organizationResult.error,
			);
		}

		return resultOk(toExpensePayload(await expenseRepository.updateExpense(input)));
	} catch (error) {
		console.error('Could not update expense', { expenseId: input.id, error });

		return resultFail('Could not update expense. Please try again later.');
	}
};

const toExpensePayload = (expense: ExpenseRecord): ExpensePayload => ({
	id: expense.id,
	type: expense.type,
	year: expense.year,
	amountChf: Number(expense.amountChf),
	organization: expense.organization,
});
