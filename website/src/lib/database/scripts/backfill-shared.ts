export const getDatabaseHost = (databaseUrl: string): string => {
	try {
		return new URL(databaseUrl).host;
	} catch {
		return 'unparseable';
	}
};

export const isLocalDatabaseHost = (host: string): boolean => {
	const normalized = host.toLowerCase();

	return (
		normalized === 'localhost' ||
		normalized.startsWith('localhost:') ||
		normalized === '127.0.0.1' ||
		normalized.startsWith('127.0.0.1:') ||
		normalized === '[::1]' ||
		normalized.startsWith('[::1]:') ||
		normalized === '::1'
	);
};


export const assertApplyAllowed = (input: { apply: boolean; databaseUrl: string; confirmApply: boolean }): void => {
	if (!input.apply) {
		return;
	}

	const host = getDatabaseHost(input.databaseUrl);
	if (isLocalDatabaseHost(host)) {
		return;
	}

	const envConfirmed = process.env.CONFIRM_APPLY === '1';
	if (input.confirmApply || envConfirmed) {
		return;
	}

	throw new Error(
		`Refusing --apply against non-local database host "${host}". Re-run with --confirm-apply or CONFIRM_APPLY=1.`,
	);
};

export const exitCodeForSummary = (summary: { errors: number; linkConflicts: number }): number =>
	summary.errors > 0 || summary.linkConflicts > 0 ? 1 : 0;

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
