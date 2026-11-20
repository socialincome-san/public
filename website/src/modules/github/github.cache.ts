import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheLife, cacheTag } from 'next/cache';
import * as service from './github.service';
import {
	GITHUB_CACHE_TAG,
	type GithubCodeContributions,
	type GithubContributor,
	type GithubOpenSourceIssuesData,
	type GithubRepoStats,
} from './github.types';

export const getOpenSourceStats = async (): Promise<Result<GithubRepoStats>> => {
	'use cache';
	cacheTag(GITHUB_CACHE_TAG);

	return cacheResult(service.getOpenSourceStats());
};

export const getOpenSourceContributors = async (): Promise<Result<GithubContributor[]>> => {
	'use cache';
	cacheTag(GITHUB_CACHE_TAG);

	return cacheResult(service.getOpenSourceContributors());
};

export const getOpenSourceIssues = async (): Promise<Result<GithubOpenSourceIssuesData>> => {
	'use cache';
	cacheTag(GITHUB_CACHE_TAG);

	return cacheResult(service.getOpenSourceIssues());
};

export const getCodeContributions = async (username: string): Promise<Result<GithubCodeContributions>> => {
	'use cache';
	cacheTag(GITHUB_CACHE_TAG);
	const result = await service.getCodeContributions(username);
	// GitHub is asked once a day per person; a failure is tried again within minutes
	if (result.success) {
		cacheLife('days');
	} else {
		cacheLife('minutes');
	}

	return result;
};
