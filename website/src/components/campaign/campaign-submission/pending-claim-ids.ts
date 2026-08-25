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
