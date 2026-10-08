'use server';

import { resultFail, type Result } from '@/lib/result';
import { communityPanelInputSchema } from './community.schemas';
import { getCommunityPanelData } from './community.service';
import type { CommunityPanelData } from './community.types';

export const getCommunityPanelDataAction = async (input: unknown): Promise<Result<CommunityPanelData | null>> => {
	const parsed = communityPanelInputSchema.safeParse(input);

	return parsed.success
		? getCommunityPanelData(parsed.data.page, parsed.data.language, parsed.data.region)
		: resultFail('Invalid community panel request');
};
