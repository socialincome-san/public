'use client';

import { getOptionalContributorAction } from '@/modules/contributors/contributor.actions';
import { ContributorSession } from '@/modules/contributors/contributor.types';
import { useEffect, useState } from 'react';

export const useContributorSession = () => {
	const [contributorSession, setContributorSession] = useState<ContributorSession | null | undefined>(undefined);

	useEffect(() => {
		void (async () => {
			const result = await getOptionalContributorAction();
			setContributorSession(result.success ? result.data : null);
		})();
	}, []);

	return {
		contributorSession,
		loading: contributorSession === undefined,
	};
};
