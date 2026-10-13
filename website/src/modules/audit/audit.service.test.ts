const mockFindAuditEvents = jest.fn();
const mockAuthorizeRecipientAuditTrail = jest.fn();

jest.mock('./audit.repository', () => ({
	findAuditEvents: mockFindAuditEvents,
}));
jest.mock('@/modules/recipients/recipient.service', () => ({
	authorizeRecipientAuditTrail: mockAuthorizeRecipientAuditTrail,
}));

import { UserRole } from '@/generated/prisma/enums';
import type { UserSession } from '@/modules/users/user.types';
import { getAuditTrail } from './audit.service';

const session: UserSession = {
	type: 'user',
	id: 'user-1',
	gender: null,
	email: null,
	firstName: null,
	lastName: null,
	language: null,
	street: null,
	number: null,
	city: null,
	zip: null,
	country: null,
	role: UserRole.user,
	activeOrganization: null,
	organizations: [],
	programs: [],
	hasAnyOperatorProgramAccess: true,
};

const row = (id: string, occurredAt: string) => ({
	id,
	occurredAt: new Date(occurredAt),
	actorType: 'user',
	actorId: 'user-1',
	entityType: 'recipient',
	entityId: 'recipient-1',
	action: 'update',
	source: 'portal',
	changes: [
		{ path: 'paymentInformation.phone.number', old: '+23270000001', new: '+23270000002' },
		{ path: 'contact.firstName', redacted: true },
	],
	metadata: null,
});

describe('getAuditTrail', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockAuthorizeRecipientAuditTrail.mockResolvedValue({ success: true, data: undefined });
	});

	test('does not query events when the entity owner denies access', async () => {
		mockAuthorizeRecipientAuditTrail.mockResolvedValue({ success: false, error: 'Permission denied' });

		const result = await getAuditTrail(session, { entityType: 'recipient', entityId: 'recipient-1' });

		expect(result).toEqual({ success: false, error: 'Permission denied', status: undefined });
		expect(mockAuthorizeRecipientAuditTrail).toHaveBeenCalledWith(session, 'recipient-1');
		expect(mockFindAuditEvents).not.toHaveBeenCalled();
	});

	test('returns newest-first events with filters and a cursor for the next page', async () => {
		mockFindAuditEvents.mockResolvedValue([
			row('event-3', '2026-10-03T00:00:00.000Z'),
			row('event-2', '2026-10-02T00:00:00.000Z'),
			row('event-1', '2026-10-01T00:00:00.000Z'),
		]);

		const result = await getAuditTrail(session, {
			entityType: 'recipient',
			entityId: 'recipient-1',
			actorType: 'user',
			actorId: 'user-1',
			action: 'update',
			from: new Date('2026-10-01T00:00:00.000Z'),
			to: new Date('2026-10-31T00:00:00.000Z'),
			limit: 2,
		});

		expect(mockFindAuditEvents).toHaveBeenCalledWith({
			filter: {
				entityType: 'recipient',
				entityId: 'recipient-1',
				actorType: 'user',
				actorId: 'user-1',
				action: 'update',
				from: new Date('2026-10-01T00:00:00.000Z'),
				to: new Date('2026-10-31T00:00:00.000Z'),
			},
			cursor: undefined,
			take: 3,
		});
		expect(result).toEqual({
			success: true,
			status: undefined,
			data: {
				events: [
					expect.objectContaining({
						id: 'event-3',
						actor: { type: 'user', id: 'user-1' },
						entity: { type: 'recipient', id: 'recipient-1' },
						changes: [
							{ path: 'paymentInformation.phone.number', old: '+23270000001', new: '+23270000002' },
							{ path: 'contact.firstName', redacted: true },
						],
					}),
					expect.objectContaining({ id: 'event-2' }),
				],
				nextCursor: 'event-2',
			},
		});
	});

	test('returns no cursor on the last page', async () => {
		mockFindAuditEvents.mockResolvedValue([row('event-1', '2026-10-01T00:00:00.000Z')]);

		const result = await getAuditTrail(session, { entityType: 'recipient', entityId: 'recipient-1', cursor: 'event-2' });

		expect(result.success && result.data.nextCursor).toBeNull();
		expect(mockFindAuditEvents).toHaveBeenCalledWith(expect.objectContaining({ cursor: 'event-2', take: 26 }));
	});

	test('rejects unknown entity types and inverted date ranges before authorizing', async () => {
		await expect(getAuditTrail(session, { entityType: 'payout' as never, entityId: 'payout-1' })).resolves.toMatchObject({
			success: false,
		});
		await expect(
			getAuditTrail(session, {
				entityType: 'recipient',
				entityId: 'recipient-1',
				from: new Date('2026-10-31T00:00:00.000Z'),
				to: new Date('2026-10-01T00:00:00.000Z'),
			}),
		).resolves.toMatchObject({ success: false });
		expect(mockAuthorizeRecipientAuditTrail).not.toHaveBeenCalled();
	});

	test('fails instead of returning a stored event that does not match the schema', async () => {
		mockFindAuditEvents.mockResolvedValue([{ ...row('event-1', '2026-10-01T00:00:00.000Z'), changes: 'broken' }]);

		const result = await getAuditTrail(session, { entityType: 'recipient', entityId: 'recipient-1' });

		expect(result).toEqual({ success: false, error: 'Could not read audit trail', status: undefined });
	});
});
