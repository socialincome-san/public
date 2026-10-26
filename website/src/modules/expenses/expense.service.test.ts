import { ExpenseType, UserRole } from '@/generated/prisma/enums';

const mockIsAdmin = jest.fn();
const mockGetOrganization = jest.fn();
const mockGetOrganizationOptions = jest.fn();
const mockFindExpenseById = jest.fn();
const mockFindPaginatedExpenses = jest.fn();
const mockCreateExpense = jest.fn();
const mockUpdateExpense = jest.fn();

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

jest.mock('@/modules/organizations/organization.service', () => ({
	getOrganization: mockGetOrganization,
	getOrganizationOptions: mockGetOrganizationOptions,
}));

jest.mock('./expense.repository.read', () => ({
	findExpenseById: mockFindExpenseById,
	findPaginatedExpenses: mockFindPaginatedExpenses,
}));

jest.mock('./expense.repository.write', () => ({
	createExpense: mockCreateExpense,
	updateExpense: mockUpdateExpense,
}));

import type { UserSession } from '@/modules/users/user.types';
import { createExpense, getPaginatedExpenseTableView, updateExpense } from './expense.service';

const admin: UserSession = {
	type: 'user',
	id: 'admin-1',
	gender: null,
	email: null,
	firstName: 'Max',
	lastName: 'Admin',
	language: null,
	street: null,
	number: null,
	city: null,
	zip: null,
	country: null,
	role: UserRole.admin,
	activeOrganization: null,
	organizations: [],
	programs: [],
	hasAnyOperatorProgramAccess: false,
};

const expense = { type: ExpenseType.administrative, year: 2026, amountChf: 100, organizationId: 'organization-1' };

describe('expense service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
	});

	test('requires admin access for the expense table', async () => {
		mockIsAdmin.mockResolvedValue({ success: false, error: 'Permission denied' });

		const result = await getPaginatedExpenseTableView('user-1', {
			page: 1,
			pageSize: 10,
			search: '',
		});

		expect(result).toEqual({
			success: false,
			error: 'Permission denied',
			status: undefined,
		});
		expect(mockFindPaginatedExpenses).not.toHaveBeenCalled();
	});

	test('passes the organization filter to the expense repository', async () => {
		const query = { page: 1, pageSize: 10, search: '', organizationId: 'organization-1' };
		mockFindPaginatedExpenses.mockResolvedValue({ expenses: [], totalCount: 0 });

		await getPaginatedExpenseTableView('admin-1', query);

		expect(mockFindPaginatedExpenses).toHaveBeenCalledWith(query);
	});

	test('rejects creation when the organization does not exist', async () => {
		mockGetOrganization.mockResolvedValue({
			success: false,
			error: 'Organization not found',
		});

		const result = await createExpense(admin, {
			type: ExpenseType.administrative,
			year: 2026,
			amountChf: 100,
			organizationId: 'missing-organization',
		});

		expect(result).toEqual({
			success: false,
			error: 'Organization not found.',
			status: undefined,
		});
		expect(mockCreateExpense).not.toHaveBeenCalled();
	});

	test('attributes writes to the admin', async () => {
		mockGetOrganization.mockResolvedValue({ success: true, data: { id: 'organization-1' } });
		mockCreateExpense.mockResolvedValue({
			...expense,
			id: 'expense-1',
			amountChf: '100',
			organization: { id: 'organization-1', name: 'SI' },
		});
		mockUpdateExpense.mockResolvedValue({
			...expense,
			id: 'expense-1',
			amountChf: '100',
			organization: { id: 'organization-1', name: 'SI' },
		});

		await createExpense(admin, expense);
		await updateExpense(admin, { ...expense, id: 'expense-1' });

		const portal = { actor: { type: 'user', id: 'admin-1', name: 'Max Admin' }, source: 'portal' };
		expect(mockCreateExpense).toHaveBeenCalledWith(portal, expense);
		expect(mockUpdateExpense).toHaveBeenCalledWith(portal, { ...expense, id: 'expense-1' });
	});
});
