import { diffVersions } from './audit-diff';

const version = {
	successorName: null,
	startDate: '2026-01-01T00:00:00.000Z',
	contact: { lastName: 'Kamara', phone: { number: '+232111', hasWhatsApp: true }, address: null },
};

describe('diffVersions', () => {
	test('returns nothing for identical versions', () => {
		expect(diffVersions(version, structuredClone(version))).toEqual([]);
	});

	test('returns changed leaves as dot paths', () => {
		const next = { ...version, successorName: 'Grace', contact: { ...version.contact, lastName: 'Koroma' } };

		expect(diffVersions(version, next)).toEqual([
			{ path: 'successorName', old: null, new: 'Grace' },
			{ path: 'contact.lastName', old: 'Kamara', new: 'Koroma' },
		]);
	});

	test('treats added and removed relations as null leaves', () => {
		const next = {
			...version,
			contact: { ...version.contact, phone: null, address: { city: 'Freetown' } },
		};

		expect(diffVersions(version, next)).toEqual([
			{ path: 'contact.phone.number', old: '+232111', new: null },
			{ path: 'contact.phone.hasWhatsApp', old: true, new: null },
			{ path: 'contact.address.city', old: null, new: 'Freetown' },
		]);
	});

	test('lists every set field on create and delete', () => {
		expect(diffVersions(null, { successorName: 'Grace', termsAccepted: false })).toEqual([
			{ path: 'successorName', old: null, new: 'Grace' },
			{ path: 'termsAccepted', old: null, new: false },
		]);
		expect(diffVersions({ successorName: 'Grace' }, null)).toEqual([{ path: 'successorName', old: 'Grace', new: null }]);
	});
});
