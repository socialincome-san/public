import { ExpenseType } from '@/generated/prisma/enums';

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

jest.mock('./expense.repository', () => ({
	findExpenseById: mockFindExpenseById,
	findPaginatedExpenses: mockFindPaginatedExpenses,
	createExpense: mockCreateExpense,
	updateExpense: mockUpdateExpense,
}));

import { createExpense, getPaginatedExpenseTableView } from './expense.service';

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

	test('rejects creation when the organization does not exist', async () => {
		mockGetOrganization.mockResolvedValue({
			success: false,
			error: 'Organization not found',
		});

		const result = await createExpense('admin-1', {
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
});
