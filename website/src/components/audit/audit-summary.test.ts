import type { AuditTableViewRow } from '@/modules/audit/audit.types';
import { getAuditActorName, getAuditEntityName } from './audit-summary';

const row: AuditTableViewRow = {
	id: 'event-1',
	createdAt: new Date('2026-10-01T00:00:00.000Z'),
	entityType: 'recipient',
	entityId: 'recipient-1',
	latestSnapshot: { contact: { firstName: 'Ada', lastName: 'Lovelace' } },
	action: 'update',
	actorType: 'recipient',
	actorName: null,
	source: 'mobile-app',
	changes: [],
};

describe('getAuditEntityName', () => {
	test('reads the name from the latest snapshot', () => {
		expect(getAuditEntityName(row)).toBe('Ada Lovelace');
	});

	test('falls back to the entity id', () => {
		expect(getAuditEntityName({ ...row, latestSnapshot: null })).toBe('recipient-1');
		expect(getAuditEntityName({ ...row, entityType: 'unknown' })).toBe('recipient-1');
	});
});

describe('getAuditActorName', () => {
	test('names the entity itself for self-updates without actor name', () => {
		expect(getAuditActorName(row)).toBe('Ada Lovelace');
		expect(getAuditActorName({ ...row, actorType: 'user', actorName: 'Max Operator' })).toBe('Max Operator');
	});
});
