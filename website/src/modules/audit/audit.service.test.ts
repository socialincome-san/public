const mockIsAdmin = jest.fn();
const mockFindAuditEventPage = jest.fn();
const mockFindAuditEventHistory = jest.fn();

jest.mock('@/modules/users/user.service', () => ({ isAdmin: mockIsAdmin }));
jest.mock('./audit.repository', () => ({
	findAuditEventPage: mockFindAuditEventPage,
	findAuditEventHistory: mockFindAuditEventHistory,
}));

import { getAuditTableView } from './audit.service';

const event = (id: string, action: string, snapshot: object | null, entityName: string | null) => ({
	id,
	entityType: 'recipient',
	entityId: 'recipient-1',
	entityName,
	action,
	actorType: 'user',
	actorName: 'Max Operator',
	source: 'portal',
	snapshot,
	createdAt: new Date('2026-10-01T00:00:00.000Z'),
});

const query = { page: 1, pageSize: 10, search: '' };

describe('getAuditTableView', () => {
	const history = [
		event('v1', 'create', { paymentInformation: { phone: { number: '+232111' } } }, 'Ada Lovelace'),
		event('v2', 'update', { paymentInformation: { phone: { number: '+232222' } } }, 'Ada King'),
		event('v3', 'delete', null, null),
	];

	beforeEach(() => {
		jest.clearAllMocks();
		mockIsAdmin.mockResolvedValue({ success: true, data: true });
		mockFindAuditEventPage.mockResolvedValue({ events: [history[1]], totalCount: 3 });
		mockFindAuditEventHistory.mockResolvedValue(history);
	});

	test('is only available to admins', async () => {
		mockIsAdmin.mockResolvedValue({ success: false, error: 'Permission denied' });

		await expect(getAuditTableView('user-1', query)).resolves.toMatchObject({ success: false });
		expect(mockFindAuditEventPage).not.toHaveBeenCalled();
	});

	test('pages, filters and searches in the database', async () => {
		await getAuditTableView('user-1', { ...query, page: 2, search: ' max ', entityType: 'recipient' });

		expect(mockFindAuditEventPage).toHaveBeenCalledWith({ entityType: 'recipient', search: 'max', skip: 10, take: 10 });
		expect(mockFindAuditEventHistory).toHaveBeenCalledWith([{ entityType: 'recipient', entityId: 'recipient-1' }]);
	});

	test('diffs each row against the previous event and keeps the latest name of deleted entities', async () => {
		await expect(getAuditTableView('user-1', query)).resolves.toMatchObject({
			success: true,
			data: {
				totalCount: 3,
				tableRows: [
					{
						id: 'v2',
						entityType: 'recipient',
						entityId: 'recipient-1',
						entityName: 'Ada King',
						actorName: 'Max Operator',
						changes: [{ path: 'paymentInformation.phone.number', old: '+232111', new: '+232222' }],
					},
				],
			},
		});
	});
});
