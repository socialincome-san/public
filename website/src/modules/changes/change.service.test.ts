const mockGetRecipientsForChangeLog = jest.fn();
const mockFindVersionPage = jest.fn();
const mockFindVersionHistory = jest.fn();

jest.mock('@/modules/recipients/recipient.service', () => ({
	getRecipientsForChangeLog: mockGetRecipientsForChangeLog,
}));
jest.mock('./change.repository', () => ({
	findVersionPage: mockFindVersionPage,
	findVersionHistory: mockFindVersionHistory,
}));

import { getChangeTableView } from './change.service';

const version = (id: string, action: string, snapshot: object | null, actorName: string | null) => ({
	id,
	entityType: 'recipient',
	entityId: 'recipient-1',
	action,
	actorType: actorName ? 'user' : 'recipient',
	actorName,
	source: actorName ? 'portal' : 'mobile-app',
	snapshot,
	createdAt: new Date('2026-10-01T00:00:00.000Z'),
});

const query = { page: 1, pageSize: 10, search: '' };

describe('getChangeTableView', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetRecipientsForChangeLog.mockResolvedValue({
			success: true,
			data: [
				{ id: 'recipient-1', name: 'Ada Lovelace', context: 'Program 1' },
				{ id: 'recipient-2', name: 'Grace Hopper', context: 'Program 1' },
			],
		});
		const history = [
			version('v1', 'create', { paymentInformation: { phone: { number: '+232111' } } }, 'Max Operator'),
			version('v2', 'update', { paymentInformation: { phone: { number: '+232222' } } }, null),
		];
		mockFindVersionPage.mockResolvedValue({ versions: [history[1]], totalCount: 2 });
		mockFindVersionHistory.mockResolvedValue(history);
	});

	test('only reads versions of entities the user may see', async () => {
		await getChangeTableView('user-1', query);

		expect(mockGetRecipientsForChangeLog).toHaveBeenCalledWith('user-1');
		expect(mockFindVersionPage).toHaveBeenCalledWith({
			scopes: [{ entityType: 'recipient', entityIds: ['recipient-1', 'recipient-2'] }],
			skip: 0,
			take: 10,
		});
	});

	test('returns nothing when the user may see nothing', async () => {
		mockGetRecipientsForChangeLog.mockResolvedValue({ success: true, data: [] });

		await expect(getChangeTableView('user-1', query)).resolves.toMatchObject({
			success: true,
			data: { tableRows: [], totalCount: 0 },
		});
		expect(mockFindVersionPage).not.toHaveBeenCalled();
	});

	test('diffs each row against the previous version, also from an earlier page', async () => {
		await expect(getChangeTableView('user-1', query)).resolves.toMatchObject({
			success: true,
			data: {
				totalCount: 2,
				entityTypeFilterOptions: [{ value: 'recipient', label: 'Recipient' }],
				tableRows: [
					{
						id: 'v2',
						entityTypeLabel: 'Recipient',
						entityName: 'Ada Lovelace',
						context: 'Program 1',
						actorName: 'Ada Lovelace',
						source: 'mobile-app',
						changes: [{ path: 'paymentInformation.phone.number', old: '+232111', new: '+232222' }],
					},
				],
			},
		});
	});

	test('searches names before paging and filters by type', async () => {
		await getChangeTableView('user-1', { ...query, page: 2, search: 'grace' });

		expect(mockFindVersionPage).toHaveBeenCalledWith({
			scopes: [{ entityType: 'recipient', entityIds: ['recipient-2'] }],
			skip: 10,
			take: 10,
		});

		mockFindVersionPage.mockClear();
		await getChangeTableView('user-1', { ...query, entityType: 'contributor' });
		expect(mockFindVersionPage).not.toHaveBeenCalled();
	});
});
