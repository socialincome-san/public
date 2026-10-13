import { computeAuditChanges } from './audit-changes';
import type { AuditFieldPolicy } from './audit-types';

type Snapshot = {
	status: string | null;
	startDate: Date | null;
	tags: string[];
	contact: {
		firstName: string;
		phone: { number: string; hasWhatsApp: boolean } | null;
	};
	token: string | null;
};

const fields: AuditFieldPolicy<Snapshot> = {
	status: 'plain',
	startDate: 'plain',
	tags: 'plain',
	'contact.firstName': 'personal',
	'contact.phone.number': 'personal',
	'contact.phone.hasWhatsApp': 'plain',
	token: 'secret',
};

const snapshot: Snapshot = {
	status: 'active',
	startDate: new Date('2026-01-01T00:00:00.000Z'),
	tags: ['a'],
	contact: {
		firstName: 'Ada',
		phone: { number: '+23270000001', hasWhatsApp: true },
	},
	token: 'secret-1',
};

describe('computeAuditChanges', () => {
	test('records nothing for unchanged snapshots', () => {
		const copy: Snapshot = {
			...snapshot,
			startDate: new Date('2026-01-01T00:00:00.000Z'),
			tags: ['a'],
			contact: { firstName: 'Ada', phone: { number: '+23270000001', hasWhatsApp: true } },
		};

		expect(computeAuditChanges('update', fields, snapshot, copy)).toEqual([]);
	});

	test('records nested changes with stable dot paths in policy order', () => {
		const after: Snapshot = {
			...snapshot,
			status: 'suspended',
			contact: { firstName: 'Grace', phone: { number: '+23270000002', hasWhatsApp: true } },
		};

		expect(computeAuditChanges('update', fields, snapshot, after)).toEqual([
			{ path: 'status', old: 'active', new: 'suspended' },
			{ path: 'contact.firstName', old: 'Ada', new: 'Grace' },
			{ path: 'contact.phone.number', old: '+23270000001', new: '+23270000002' },
		]);
	});

	test('serializes dates and compares them by value', () => {
		const sameInstant = { ...snapshot, startDate: new Date('2026-01-01T00:00:00.000Z') };
		const later = { ...snapshot, startDate: new Date('2026-02-01T00:00:00.000Z') };

		expect(computeAuditChanges('update', fields, snapshot, sameInstant)).toEqual([]);
		expect(computeAuditChanges('update', fields, snapshot, later)).toEqual([
			{ path: 'startDate', old: '2026-01-01T00:00:00.000Z', new: '2026-02-01T00:00:00.000Z' },
		]);
	});

	test('treats a removed relation as null leaves and ignores null to null', () => {
		const after: Snapshot = { ...snapshot, startDate: null, contact: { ...snapshot.contact, phone: null } };
		const before: Snapshot = { ...snapshot, startDate: null };

		expect(computeAuditChanges('update', fields, before, after)).toEqual([
			{ path: 'contact.phone.number', old: '+23270000001', new: null },
			{ path: 'contact.phone.hasWhatsApp', old: true, new: null },
		]);
	});

	test('compares arrays by content', () => {
		expect(computeAuditChanges('update', fields, snapshot, { ...snapshot, tags: ['a'] })).toEqual([]);
		expect(computeAuditChanges('update', fields, snapshot, { ...snapshot, tags: ['a', 'b'] })).toEqual([
			{ path: 'tags', old: ['a'], new: ['a', 'b'] },
		]);
	});

	test('never stores secret values', () => {
		expect(computeAuditChanges('update', fields, snapshot, { ...snapshot, token: 'secret-2' })).toEqual([
			{ path: 'token', redacted: true },
		]);
	});

	test('stores plain values on create but only marks personal and secret fields as set', () => {
		expect(computeAuditChanges('create', fields, null, snapshot)).toEqual([
			{ path: 'status', old: null, new: 'active' },
			{ path: 'startDate', old: null, new: '2026-01-01T00:00:00.000Z' },
			{ path: 'tags', old: null, new: ['a'] },
			{ path: 'contact.firstName', redacted: true },
			{ path: 'contact.phone.number', redacted: true },
			{ path: 'contact.phone.hasWhatsApp', old: null, new: true },
			{ path: 'token', redacted: true },
		]);
	});

	test('does not keep a copy of personal data on delete', () => {
		const changes = computeAuditChanges('delete', fields, snapshot, null);

		expect(changes).toContainEqual({ path: 'status', old: 'active', new: null });
		expect(changes).toContainEqual({ path: 'contact.firstName', redacted: true });
		expect(JSON.stringify(changes)).not.toContain('Ada');
		expect(JSON.stringify(changes)).not.toContain('+23270000001');
	});

	test('rejects a policy path that points at an object', () => {
		expect(() => computeAuditChanges('update', { contact: 'plain' }, snapshot, snapshot)).toThrow(
			'Audit field "contact" is not a leaf value',
		);
	});
});
