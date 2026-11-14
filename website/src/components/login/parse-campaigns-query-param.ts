const readCampaignsParam = (searchParams: URLSearchParams): string[] => {
	const raw = searchParams.get('campaigns');
	if (!raw) {
		return [];
	}

	const seen = new Set<string>();
	const claimIds: string[] = [];

	for (const part of raw.split(',')) {
		const trimmed = part.trim();
		if (!trimmed || seen.has(trimmed)) {
			continue;
		}
		seen.add(trimmed);
		claimIds.push(trimmed);
	}

	return claimIds;
};

export const getEmailFromLoginUrl = (url: string): string | null => {
	try {
		const searchParams = new URL(url).searchParams;
		const email = searchParams.get('email');
		if (email) {
			return email;
		}

		const continueUrl = searchParams.get('continueUrl');

		return continueUrl ? new URL(continueUrl).searchParams.get('email') : null;
	} catch {
		return null;
	}
};

export const parseCampaignsQueryParam = (url: string): string[] => {
	try {
		const searchParams = new URL(url).searchParams;
		const fromTopLevel = readCampaignsParam(searchParams);
		if (fromTopLevel.length > 0) {
			return fromTopLevel;
		}

		const continueUrl = searchParams.get('continueUrl');
		if (!continueUrl) {
			return [];
		}

		return readCampaignsParam(new URL(continueUrl).searchParams);
	} catch {
		return [];
	}
};
