import { diffSnapshots } from './audit-diff';

const snapshot = {
	successorName: null,
	startDate: '2026-01-01T00:00:00.000Z',
	contact: { lastName: 'Kamara', phone: { number: '+232111', hasWhatsApp: true }, address: null },
};

describe('diffSnapshots', () => {
	test('returns nothing for identical snapshots', () => {
		expect(diffSnapshots(snapshot, structuredClone(snapshot))).toEqual([]);
	});

	test('returns changed leaves as dot paths', () => {
		const next = { ...snapshot, successorName: 'Grace', contact: { ...snapshot.contact, lastName: 'Koroma' } };

		expect(diffSnapshots(snapshot, next)).toEqual([
			{ path: 'successorName', old: null, new: 'Grace' },
			{ path: 'contact.lastName', old: 'Kamara', new: 'Koroma' },
		]);
	});

	test('treats added and removed relations as null leaves', () => {
		const next = {
			...snapshot,
			contact: { ...snapshot.contact, phone: null, address: { city: 'Freetown' } },
		};

		expect(diffSnapshots(snapshot, next)).toEqual([
			{ path: 'contact.phone.number', old: '+232111', new: null },
			{ path: 'contact.phone.hasWhatsApp', old: true, new: null },
			{ path: 'contact.address.city', old: null, new: 'Freetown' },
		]);
	});

	test('lists every set field on create and delete', () => {
		expect(diffSnapshots(null, { successorName: 'Grace', termsAccepted: false })).toEqual([
			{ path: 'successorName', old: null, new: 'Grace' },
			{ path: 'termsAccepted', old: null, new: false },
		]);
		expect(diffSnapshots({ successorName: 'Grace' }, null)).toEqual([{ path: 'successorName', old: 'Grace', new: null }]);
	});
});
