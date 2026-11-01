'use server';

import { resultFail, type Result } from '@/lib/result';
import { circleLanguageSchema } from './circle.schemas';
import { getCircleSummaries } from './circle.service';
import type { CircleSummary } from './circle.types';

export const getCircleSummariesAction = async (input: unknown): Promise<Result<CircleSummary[]>> => {
	const parsed = circleLanguageSchema.safeParse(input);

	return parsed.success ? getCircleSummaries(parsed.data) : resultFail('Invalid circle language');
};
