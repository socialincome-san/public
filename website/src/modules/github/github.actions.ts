'use server';

import type { ServiceResult } from '@/lib/service-result';
import { getOpenSourceContributors, getOpenSourceIssues, getOpenSourceStats } from './github.service';
import type { GithubContributor, GithubOpenSourceIssuesData, GithubRepoStats } from './github.types';

export const getOpenSourceStatsAction = async (): Promise<ServiceResult<GithubRepoStats>> => getOpenSourceStats();

export const getOpenSourceContributorsAction = async (): Promise<ServiceResult<GithubContributor[]>> =>
	getOpenSourceContributors();

export const getOpenSourceIssuesAction = async (): Promise<ServiceResult<GithubOpenSourceIssuesData>> =>
	getOpenSourceIssues();
