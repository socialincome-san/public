const PENDING_CLAIM_IDS_STORAGE_KEY = 'campaign_pending_claim_ids';

const isBrowser = () => typeof window !== 'undefined';

const parsePendingClaimIds = (value: unknown): string[] => {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter((entry): entry is string => typeof entry === 'string');
};

export const readPendingClaimIds = (): string[] => {
	if (!isBrowser()) {
		return [];
	}

	try {
		const raw = window.localStorage.getItem(PENDING_CLAIM_IDS_STORAGE_KEY);
		if (!raw) {
			return [];
		}

		return parsePendingClaimIds(JSON.parse(raw) as unknown);
	} catch {
		return [];
	}
};

export const addPendingClaimId = (claimId: string): void => {
	if (!isBrowser()) {
		return;
	}

	const trimmed = claimId.trim();
	if (!trimmed) {
		return;
	}

	const existing = readPendingClaimIds();
	if (existing.includes(trimmed)) {
		return;
	}

	try {
		window.localStorage.setItem(PENDING_CLAIM_IDS_STORAGE_KEY, JSON.stringify([...existing, trimmed]));
	} catch {
		// Fail soft: submission already succeeded; storage may be full or blocked.
	}
};

export const removePendingClaimIds = (claimIds: readonly string[]): void => {
	if (!isBrowser() || claimIds.length === 0) {
		return;
	}

	const toRemove = new Set(claimIds.map((claimId) => claimId.trim()).filter(Boolean));
	if (toRemove.size === 0) {
		return;
	}

	const remaining = readPendingClaimIds().filter((claimId) => !toRemove.has(claimId));

	try {
		if (remaining.length === 0) {
			window.localStorage.removeItem(PENDING_CLAIM_IDS_STORAGE_KEY);

			return;
		}

		window.localStorage.setItem(PENDING_CLAIM_IDS_STORAGE_KEY, JSON.stringify(remaining));
	} catch {
		// Fail soft: claim already processed server-side.
	}
};
