import { PayoutProcess, UserRole } from '@/generated/prisma/enums';
import type { UserSession } from '@/modules/users/user.types';

const mockIsAdmin = jest.fn();
const mockFindPaginatedMobileMoneyProviders = jest.fn();
const mockFindMobileMoneyProvidersWithPayoutProcess = jest.fn();
const mockFindMobileMoneyProviderForDeletion = jest.fn();
const mockDeleteMobileMoneyProvider = jest.fn();

jest.mock('@/modules/users/user.service', () => ({
	isAdmin: mockIsAdmin,
}));

jest.mock('./mobile-money-provider.repository.read', () => ({
	findPaginatedMobileMoneyProviders: mockFindPaginatedMobileMoneyProviders,
	findMobileMoneyProvidersWithPayoutProcess: mockFindMobileMoneyProvidersWithPayoutProcess,
	findMobileMoneyProviderForDeletion: mockFindMobileMoneyProviderForDeletion,
}));

jest.mock('./mobile-money-provider.repository.write', () => ({
	deleteMobileMoneyProvider: mockDeleteMobileMoneyProvider,
}));

import {
	deleteMobileMoneyProvider,
	getPaginatedMobileMoneyProviderTableView,
	getPayoutProcessOverviewOptions,
} from './mobile-money-provider.service';

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

describe('mobile money provider service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
	});

	test('requires admin access for the table view', async () => {
		mockIsAdmin.mockResolvedValue({
			success: false,
			error: 'Permission denied',
		});

		await expect(
			getPaginatedMobileMoneyProviderTableView('user-1', {
				page: 1,
				pageSize: 10,
				search: '',
			}),
		).resolves.toEqual({
			success: false,
			error: 'Permission denied',
			status: undefined,
		});
		expect(mockFindPaginatedMobileMoneyProviders).not.toHaveBeenCalled();
	});

	test('passes country and parent filters to the provider repository', async () => {
		const query = {
			page: 1,
			pageSize: 10,
			search: '',
			countryId: 'country-1',
			parentProviderId: 'provider-parent',
		};
		mockFindPaginatedMobileMoneyProviders.mockResolvedValue({ providers: [], totalCount: 0 });

		await getPaginatedMobileMoneyProviderTableView('admin-1', query);

		expect(mockFindPaginatedMobileMoneyProviders).toHaveBeenCalledWith(query);
	});

	test('groups Telecel providers into one payout process option', async () => {
		mockFindMobileMoneyProvidersWithPayoutProcess.mockResolvedValue([
			{
				id: 'orange',
				name: 'Orange',
				payoutProcess: PayoutProcess.orange_money_csv,
			},
			{
				id: 'telecel-1',
				name: 'Telecel One',
				payoutProcess: PayoutProcess.telecel_csv,
			},
			{
				id: 'telecel-2',
				name: 'Telecel Two',
				payoutProcess: PayoutProcess.telecel_csv,
			},
		]);

		await expect(getPayoutProcessOverviewOptions()).resolves.toEqual({
			success: true,
			data: [
				{
					kind: 'mobile_money_provider',
					id: 'orange',
					name: 'Orange',
					payoutProcess: PayoutProcess.orange_money_csv,
				},
				{
					kind: 'telecel_csv',
					id: 'telecel_csv',
					name: 'Telecel CSV upload',
					payoutProcess: PayoutProcess.telecel_csv,
					providerNames: ['Telecel One', 'Telecel Two'],
				},
			],
			status: undefined,
		});
	});

	test('blocks deleting a provider that is still in use', async () => {
		mockFindMobileMoneyProviderForDeletion.mockResolvedValue({
			id: 'provider-1',
			_count: { countries: 1, paymentInformations: 0 },
		});

		await expect(deleteMobileMoneyProvider(admin, 'provider-1')).resolves.toEqual({
			success: false,
			error: 'Cannot delete mobile money provider because it is still in use',
			status: undefined,
		});
		expect(mockDeleteMobileMoneyProvider).not.toHaveBeenCalled();
	});
});

describe('mobile-money-provider write attribution', () => {
	test('attributes deletes to the admin', async () => {
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		mockFindMobileMoneyProviderForDeletion.mockResolvedValue({
			id: 'entity-1',
			_count: { countries: 0, paymentInformations: 0 },
		});
		mockDeleteMobileMoneyProvider.mockResolvedValue({ id: 'entity-1' });

		await deleteMobileMoneyProvider(admin, 'entity-1');

		expect(mockDeleteMobileMoneyProvider).toHaveBeenCalledWith(
			{ actor: { type: 'user', id: 'admin-1', name: 'Max Admin' }, source: 'portal' },
			'entity-1',
		);
	});
});
