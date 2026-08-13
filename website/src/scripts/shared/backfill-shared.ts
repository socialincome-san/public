export const getDatabaseHost = (databaseUrl: string): string => {
	try {
		return new URL(databaseUrl).host;
	} catch {
		return 'unparseable';
	}
};

export const log = (message: string) => console.info(message);

export const printSummary = (summary: Record<string, number>) => {
	log('');
	log('=== Summary ===');
	for (const [key, value] of Object.entries(summary)) {
		log(`${key}: ${value}`);
	}
};

export const assertDatabaseUrl = () => {
	if (!process.env.DATABASE_URL) {
		throw new Error('Missing DATABASE_URL');
	}
};

export const exitCodeForSummary = (summary: { errors: number; subscriptionsCreated: number }, apply: boolean): number => {
	if (summary.errors > 0) {
		return 1;
	}
	if (!apply && summary.subscriptionsCreated > 0) {
		return 1;
	}

	return 0;
};

const parsePositiveIntFlag = (argv: string[], flag: string): number | null => {
	const arg = argv.find((value) => value.startsWith(`${flag}=`));
	if (!arg) {
		return null;
	}

	const raw = arg.slice(`${flag}=`.length);
	const parsed = Number(raw);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new Error(`Invalid ${flag} value: ${raw}`);
	}

	return parsed;
};

const DEFAULT_CONCURRENCY = 2;

export const parseBackfillCliOptions = (argv: string[]) => ({
	apply: argv.includes('--apply'),
	limit: parsePositiveIntFlag(argv, '--limit'),
	concurrency: parsePositiveIntFlag(argv, '--concurrency') ?? DEFAULT_CONCURRENCY,
});

export const mapWithConcurrency = async <T>(
	items: T[],
	concurrency: number,
	worker: (item: T) => Promise<void>,
): Promise<void> => {
	let nextIndex = 0;

	const runWorker = async () => {
		while (nextIndex < items.length) {
			const currentIndex = nextIndex;
			nextIndex += 1;
			await worker(items[currentIndex]);
		}
	};

	const workers = Array.from({ length: Math.min(concurrency, Math.max(items.length, 1)) }, () => runWorker());
	await Promise.all(workers);
};
