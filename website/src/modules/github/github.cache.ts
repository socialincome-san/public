import type { Result } from '@/lib/result';
import { cacheResult } from '@/lib/result-cache';
import { cacheTag } from 'next/cache';
import * as service from './github.service';
import {
	GITHUB_CACHE_TAG,
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
