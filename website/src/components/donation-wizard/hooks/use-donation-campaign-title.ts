'use client';

import { getPublicCampaignTitleAction } from '@/lib/server-actions/campaign-public-actions';
import { useEffect, useState } from 'react';

type FetchedCampaignTitle = {
	campaignId: string;
	title: string;
};

export const useDonationCampaignTitle = (campaignId: string | undefined, enabled: boolean) => {
	const [fetched, setFetched] = useState<FetchedCampaignTitle | null>(null);
	const shouldFetch = Boolean(enabled && campaignId);

	useEffect(() => {
		if (!shouldFetch || !campaignId) {
			return;
		}

		const requestedCampaignId = campaignId;
		let cancelled = false;

		const loadTitle = async () => {
			const result = await getPublicCampaignTitleAction(requestedCampaignId);
			if (cancelled) {
				return;
			}

			setFetched(result.success ? { campaignId: requestedCampaignId, title: result.data.title } : null);
		};

		void loadTitle();

		return () => {
			cancelled = true;
		};
	}, [campaignId, shouldFetch]);

	if (!shouldFetch || !campaignId || fetched?.campaignId !== campaignId) {
		return null;
	}

	return fetched.title;
};
