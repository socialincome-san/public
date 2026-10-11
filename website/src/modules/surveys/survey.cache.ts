import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as service from './survey.service';
import {
	SURVEY_CACHE_TAG,
	type SurveyImpactData,
	type SurveyImpactFilterOptions,
	type SurveyImpactFilters,
	type SurveyImpactStudyDetails,
} from './survey.types';

export const getSurveyImpactMeasurements = async (filters?: SurveyImpactFilters): Promise<Result<SurveyImpactData>> => {
	'use cache';
	cacheTag(SURVEY_CACHE_TAG);

	return cacheResult(service.getSurveyImpactMeasurements(filters));
};

export const getSurveyImpactFilterOptions = async (): Promise<Result<SurveyImpactFilterOptions>> => {
	'use cache';
	cacheTag(SURVEY_CACHE_TAG);

	return cacheResult(service.getSurveyImpactFilterOptions());
};

export const getSurveyImpactStudyDetails = async (
	filters?: SurveyImpactFilters,
): Promise<Result<SurveyImpactStudyDetails>> => {
	'use cache';
	cacheTag(SURVEY_CACHE_TAG);

	return cacheResult(service.getSurveyImpactStudyDetails(filters));
};
