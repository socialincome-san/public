const mockGetSessionByType = jest.fn();
const mockGetAuditTrail = jest.fn();

jest.mock('@/modules/auth/session.service', () => ({
	getSessionByType: mockGetSessionByType,
}));
jest.mock('./audit.service', () => ({
	getAuditTrail: mockGetAuditTrail,
}));

import { getAuditTrailAction } from './audit.actions';

describe('getAuditTrailAction', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetSessionByType.mockResolvedValue({ success: true, data: { type: 'local-partner', id: 'partner-1' } });
		mockGetAuditTrail.mockResolvedValue({ success: true, data: { events: [], nextCursor: null } });
	});

	test('rejects contributor sessions before resolving a session', async () => {
		await expect(getAuditTrailAction({ entityType: 'recipient', entityId: 'recipient-1' }, 'contributor')).resolves.toEqual({
			success: false,
			error: 'Invalid session type',
			status: undefined,
		});
		expect(mockGetSessionByType).not.toHaveBeenCalled();
	});

	test('rejects an invalid query without reading the trail', async () => {
		await expect(getAuditTrailAction({ entityType: 'recipient' }, 'local-partner')).resolves.toMatchObject({
			success: false,
		});
		expect(mockGetAuditTrail).not.toHaveBeenCalled();
	});

	test('passes the parsed query and the session to the service', async () => {
		await getAuditTrailAction(
			{ entityType: 'recipient', entityId: 'recipient-1', from: '2026-10-01T00:00:00.000Z', limit: '10' },
			'local-partner',
		);

		expect(mockGetSessionByType).toHaveBeenCalledWith('local-partner');
		expect(mockGetAuditTrail).toHaveBeenCalledWith(
			{ type: 'local-partner', id: 'partner-1' },
			{ entityType: 'recipient', entityId: 'recipient-1', from: new Date('2026-10-01T00:00:00.000Z'), limit: 10 },
		);
	});
});
