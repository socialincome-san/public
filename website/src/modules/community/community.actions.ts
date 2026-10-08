'use server';

import { resultFail, type Result } from '@/lib/result';
import { draftMode } from 'next/headers';
import { getCommunityPanelData } from './community.cache';
import { communityPanelInputSchema } from './community.schemas';
import type { CommunityPanelData } from './community.types';

// Only the Storyblok preview needs this, so it is closed to visitors without the draft mode cookie
export const getCommunityPanelDataAction = async (input: unknown): Promise<Result<CommunityPanelData | null>> => {
	if (!(await draftMode()).isEnabled) {
		return resultFail('Community panel preview requires draft mode.');
	}

	const parsed = communityPanelInputSchema.safeParse(input);

	return parsed.success
		? getCommunityPanelData(parsed.data.page, parsed.data.language, parsed.data.region)
		: resultFail('Invalid community panel request');
};
