import type { AuditTableViewRow } from '@/modules/audit/audit.types';
import { getAuditActorName, getAuditEntityName } from './audit-summary';

const row: AuditTableViewRow = {
	id: 'event-1',
	createdAt: new Date('2026-10-01T00:00:00.000Z'),
	entityType: 'recipient',
	entityId: 'recipient-1',
	entityName: 'Ada Lovelace',
	action: 'update',
	actorType: 'recipient',
	actorName: null,
	source: 'mobile-app',
	changes: [],
};

describe('getAuditEntityName', () => {
	test('shows the stored name and falls back to the entity id', () => {
		expect(getAuditEntityName(row)).toBe('Ada Lovelace');
		expect(getAuditEntityName({ ...row, entityName: null })).toBe('recipient-1');
	});
});

describe('getAuditActorName', () => {
	test('names the entity itself for self-updates without actor name', () => {
		expect(getAuditActorName(row)).toBe('Ada Lovelace');
		expect(getAuditActorName({ ...row, actorType: 'user', actorName: 'Max Operator' })).toBe('Max Operator');
	});
});
