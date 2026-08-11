import {
	assertDatabaseUrl,
	exitCodeForSummary,
	getDatabaseHost,
	parsePositiveIntFlag,
	resolveStripeResourceId,
} from './backfill-shared';

describe('backfill-shared', () => {
	test('getDatabaseHost', () => {
		expect(getDatabaseHost('postgresql://u:p@localhost:5432/db')).toBe('localhost:5432');
		expect(getDatabaseHost('not-a-url')).toBe('unparseable');
	});

	test('assertDatabaseUrl', () => {
		const previous = process.env.DATABASE_URL;
		delete process.env.DATABASE_URL;
		expect(() => assertDatabaseUrl()).toThrow('Missing DATABASE_URL');
		process.env.DATABASE_URL = previous ?? 'postgresql://u:p@localhost:5432/db';
		expect(() => assertDatabaseUrl()).not.toThrow();
		if (previous === undefined) {
			delete process.env.DATABASE_URL;
		} else {
			process.env.DATABASE_URL = previous;
		}
	});

	test('exitCodeForSummary', () => {
		expect(exitCodeForSummary({ errors: 0 })).toBe(0);
		expect(exitCodeForSummary({ errors: 1 })).toBe(1);
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
