import {
	assertDatabaseUrl,
	exitCodeForCreateOnlyScript,
	exitCodeForSummary,
	getDatabaseHost,
	mapWithConcurrency,
	parseBackfillCliOptions,
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

	test('exitCodeForCreateOnlyScript', () => {
		expect(exitCodeForCreateOnlyScript({ errors: 0, recordsToCreate: 0 }, false)).toBe(0);
		expect(exitCodeForCreateOnlyScript({ errors: 1, recordsToCreate: 0 }, false)).toBe(1);
		expect(exitCodeForCreateOnlyScript({ errors: 0, recordsToCreate: 3 }, false)).toBe(1);
		expect(exitCodeForCreateOnlyScript({ errors: 0, recordsToCreate: 3 }, true)).toBe(0);
	});

	test('exitCodeForSummary', () => {
		expect(exitCodeForSummary({ errors: 0, subscriptionsCreated: 0 }, false)).toBe(0);
		expect(exitCodeForSummary({ errors: 1, subscriptionsCreated: 0 }, false)).toBe(1);
		expect(exitCodeForSummary({ errors: 0, subscriptionsCreated: 3 }, false)).toBe(1);
		expect(exitCodeForSummary({ errors: 0, subscriptionsCreated: 3 }, true)).toBe(0);
	});

	test('parseBackfillCliOptions', () => {
		expect(parseBackfillCliOptions([])).toEqual({ apply: false, limit: null, concurrency: 2 });
		expect(parseBackfillCliOptions(['--apply', '--limit=10', '--concurrency=4'])).toEqual({
			apply: true,
			limit: 10,
			concurrency: 4,
		});
		expect(() => parseBackfillCliOptions(['--limit=0'])).toThrow('Invalid --limit value');
		expect(() => parseBackfillCliOptions(['--concurrency=-1'])).toThrow('Invalid --concurrency value');
	});

	test('mapWithConcurrency processes every item once', async () => {
		for (const concurrency of [1, 3]) {
			const seen: number[] = [];
			await mapWithConcurrency([1, 2, 3, 4, 5], concurrency, (item) => {
				seen.push(item);

				return Promise.resolve();
			});
			expect(seen.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
		}
	});
});
