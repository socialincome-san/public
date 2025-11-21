'use client';

import { getOptionalContributorAction } from '@/lib/server-actions/contributor-actions';
import { ContributorSession } from '@socialincome/shared/src/database/services/contributor/contributor.types';
import { useEffect, useState } from 'react';

export function useContributorSession() {
	const [contributorSession, setContributorSession] = useState<ContributorSession | null | undefined>(undefined);

	useEffect(() => {
		(async () => {
			const result = await getOptionalContributorAction();
			setContributorSession(result);
		})();
	}, []);

	return {
		contributorSession,
		loading: contributorSession === undefined,
	};
}
