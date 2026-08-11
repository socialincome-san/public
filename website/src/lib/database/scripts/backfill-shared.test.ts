import {
	assertApplyAllowed,
	exitCodeForSummary,
	getDatabaseHost,
	isLocalDatabaseHost,
	parsePositiveIntFlag,
	resolveStripeResourceId,
} from './backfill-shared';

describe('backfill-shared', () => {
	test('getDatabaseHost', () => {
		expect(getDatabaseHost('postgresql://u:p@localhost:5432/db')).toBe('localhost:5432');
		expect(getDatabaseHost('not-a-url')).toBe('unparseable');
	});

	test('isLocalDatabaseHost', () => {
		expect(isLocalDatabaseHost('localhost:5432')).toBe(true);
		expect(isLocalDatabaseHost('127.0.0.1')).toBe(true);
		expect(isLocalDatabaseHost('[::1]:5432')).toBe(true);
		expect(isLocalDatabaseHost('db.example:5432')).toBe(false);
	});

	test('assertApplyAllowed', () => {
		expect(() =>
			assertApplyAllowed({
				apply: false,
				databaseUrl: 'postgresql://u:p@db.example:5432/db',
				confirmApply: false,
			}),
		).not.toThrow();

		expect(() =>
			assertApplyAllowed({
				apply: true,
				databaseUrl: 'postgresql://u:p@localhost:5432/db',
				confirmApply: false,
			}),
		).not.toThrow();

		expect(() =>
			assertApplyAllowed({
				apply: true,
				databaseUrl: 'postgresql://u:p@db.example:5432/db',
				confirmApply: false,
			}),
		).toThrow('Refusing --apply against non-local database host');

		expect(() =>
			assertApplyAllowed({
				apply: true,
				databaseUrl: 'postgresql://u:p@db.example:5432/db',
				confirmApply: true,
			}),
		).not.toThrow();
	});

	test('exitCodeForSummary', () => {
		expect(exitCodeForSummary({ errors: 0, linkConflicts: 0 })).toBe(0);
		expect(exitCodeForSummary({ errors: 1, linkConflicts: 0 })).toBe(1);
		expect(exitCodeForSummary({ errors: 0, linkConflicts: 2 })).toBe(1);
	});

	test('parsePositiveIntFlag', () => {
		expect(parsePositiveIntFlag([], '--limit')).toBeNull();
		expect(parsePositiveIntFlag(['--limit=3'], '--limit')).toBe(3);
		expect(() => parsePositiveIntFlag(['--limit=0'], '--limit')).toThrow('Invalid --limit value');
	});

	test('resolveStripeResourceId', () => {
		expect(resolveStripeResourceId('id_1')).toBe('id_1');
		expect(resolveStripeResourceId({ id: 'id_2' })).toBe('id_2');
		expect(resolveStripeResourceId(null)).toBeNull();
	});
});
