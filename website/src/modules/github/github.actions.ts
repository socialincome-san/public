'use server';

import type { Result } from '@/lib/result';
import { getOpenSourceContributors, getOpenSourceIssues, getOpenSourceStats } from './github.service';
import type { GithubContributor, GithubOpenSourceIssuesData, GithubRepoStats } from './github.types';

export const getOpenSourceStatsAction = async (): Promise<Result<GithubRepoStats>> => getOpenSourceStats();

export const getOpenSourceContributorsAction = async (): Promise<Result<GithubContributor[]>> => getOpenSourceContributors();

export const getOpenSourceIssuesAction = async (): Promise<Result<GithubOpenSourceIssuesData>> => getOpenSourceIssues();
