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

export const exitCodeForSummary = (summary: { errors: number }): number => (summary.errors > 0 ? 1 : 0);

export const parsePositiveIntFlag = (argv: string[], flag: string): number | null => {
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

export const resolveStripeResourceId = (value: string | { id: string } | null | undefined): string | null => {
	if (!value) {
		return null;
	}
	if (typeof value === 'string') {
		return value;
	}

	return value.id;
};
