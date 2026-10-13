const mockGetRecipientsForAuditLog = jest.fn();
const mockFindAuditEventPage = jest.fn();
const mockFindAuditEventHistory = jest.fn();

jest.mock('@/modules/recipients/recipient.service', () => ({
	getRecipientsForAuditLog: mockGetRecipientsForAuditLog,
}));
jest.mock('./audit.repository', () => ({
	findAuditEventPage: mockFindAuditEventPage,
	findAuditEventHistory: mockFindAuditEventHistory,
}));

import { getAuditTableView } from './audit.service';

const event = (id: string, action: string, snapshot: object | null, actorName: string | null) => ({
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

describe('getAuditTableView', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetRecipientsForAuditLog.mockResolvedValue({
			success: true,
			data: [
				{ id: 'recipient-1', name: 'Ada Lovelace', context: 'Program 1' },
				{ id: 'recipient-2', name: 'Grace Hopper', context: 'Program 1' },
			],
		});
		const history = [
			event('v1', 'create', { paymentInformation: { phone: { number: '+232111' } } }, 'Max Operator'),
			event('v2', 'update', { paymentInformation: { phone: { number: '+232222' } } }, null),
		];
		mockFindAuditEventPage.mockResolvedValue({ events: [history[1]], totalCount: 2 });
		mockFindAuditEventHistory.mockResolvedValue(history);
	});

	test('only reads events of entities the user may see', async () => {
		await getAuditTableView('user-1', query);

		expect(mockGetRecipientsForAuditLog).toHaveBeenCalledWith('user-1');
		expect(mockFindAuditEventPage).toHaveBeenCalledWith({
			scopes: [{ entityType: 'recipient', entityIds: ['recipient-1', 'recipient-2'] }],
			skip: 0,
			take: 10,
		});
	});

	test('returns nothing when the user may see nothing', async () => {
		mockGetRecipientsForAuditLog.mockResolvedValue({ success: true, data: [] });

		await expect(getAuditTableView('user-1', query)).resolves.toMatchObject({
			success: true,
			data: { tableRows: [], totalCount: 0 },
		});
		expect(mockFindAuditEventPage).not.toHaveBeenCalled();
	});

	test('diffs each row against the previous event, also from an earlier page', async () => {
		await expect(getAuditTableView('user-1', query)).resolves.toMatchObject({
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
		await getAuditTableView('user-1', { ...query, page: 2, search: 'grace' });

		expect(mockFindAuditEventPage).toHaveBeenCalledWith({
			scopes: [{ entityType: 'recipient', entityIds: ['recipient-2'] }],
			skip: 10,
			take: 10,
		});

		mockFindAuditEventPage.mockClear();
		await getAuditTableView('user-1', { ...query, entityType: 'contributor' });
		expect(mockFindAuditEventPage).not.toHaveBeenCalled();
	});
});
