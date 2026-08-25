import { addPendingClaimId, readPendingClaimIds } from './pending-claim-ids';

const STORAGE_KEY = 'campaign_pending_claim_ids';

const createLocalStorageMock = () => {
	const store = new Map<string, string>();

	return {
		clear: () => {
			store.clear();
		},
		getItem: (key: string) => store.get(key) ?? null,
		removeItem: (key: string) => {
			store.delete(key);
		},
		setItem: (key: string, value: string) => {
			store.set(key, value);
		},
	};
};

describe('pending-claim-ids', () => {
	beforeEach(() => {
		Object.defineProperty(globalThis, 'window', {
			configurable: true,
			value: {
				localStorage: createLocalStorageMock(),
			},
			writable: true,
		});
	});

	afterEach(() => {
		Reflect.deleteProperty(globalThis, 'window');
	});

	test('readPendingClaimIds returns an empty array when missing', () => {
		expect(readPendingClaimIds()).toEqual([]);
	});

	test('readPendingClaimIds returns an empty array for corrupt JSON', () => {
		window.localStorage.setItem(STORAGE_KEY, '{not-json');

		expect(readPendingClaimIds()).toEqual([]);
	});

	test('readPendingClaimIds returns an empty array for a non-array value', () => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ claimId: 'Ab12Cd34' }));

		expect(readPendingClaimIds()).toEqual([]);
	});

	test('readPendingClaimIds keeps string entries and drops non-strings', () => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['Ab12Cd34', 42, null, 'Xy98Zk76', { id: 'x' }]));

		expect(readPendingClaimIds()).toEqual(['Ab12Cd34', 'Xy98Zk76']);
	});

	test('addPendingClaimId appends and dedupes claim ids', () => {
		addPendingClaimId('Ab12Cd34');
		addPendingClaimId('Xy98Zk76');
		addPendingClaimId('Ab12Cd34');

		expect(readPendingClaimIds()).toEqual(['Ab12Cd34', 'Xy98Zk76']);
		expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual(['Ab12Cd34', 'Xy98Zk76']);
	});

	test('addPendingClaimId no-ops on an empty claim id', () => {
		addPendingClaimId('   ');

		expect(readPendingClaimIds()).toEqual([]);
		expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
	});
});
