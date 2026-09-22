'use server';

import type {
	Campaign,
	Country,
	Focus,
	LocalPartner,
	Person,
	Program,
} from '@/generated/storyblok/types/109655/storyblok-components';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { buildPreviewCacheKey, setPreviewCache } from '@/lib/storyblok-preview/preview-cache';
import { verifyStoryblokPreviewToken } from '@/lib/storyblok-preview/preview-token';
import type { ISbStoryData } from '@storyblok/js';
import { revalidatePath } from 'next/cache';
import {
	storyblokLanguageSchema,
	storyblokPreviewUpdateSchema,
	storyblokSlugInputSchema,
	storyblokStoryInputSchema,
	storyblokStringListInputSchema,
} from './storyblok-content.schemas';
import {
	getAllPersons,
	getCampaignBySlug,
	getCampaigns,
	getCountries,
	getCountryByIsoCode,
	getFocusBySlug,
	getFocuses,
	getLocalPartners,
	getPersonsByCountryOffice,
	getPersonsByUuids,
	getPrimaryRoleLabels,
	getProgramBySlug,
	getPrograms,
	getStoryTitle,
	getStoryWithFallback,
} from './storyblok-content.service';
import type { StoryTitleData } from './storyblok-content.types';

export const getStoryWithFallbackAction = async <T>(input: unknown): Promise<ServiceResult<T>> => {
	const parsed = storyblokStoryInputSchema.safeParse(input);

	return parsed.success
		? getStoryWithFallback<T>(parsed.data.storyPath, parsed.data.language)
		: resultFail('Invalid Storyblok story request');
};

export const getStoryTitleAction = async (input: unknown): Promise<ServiceResult<StoryTitleData>> => {
	const parsed = storyblokStoryInputSchema.safeParse(input);

	return parsed.success
		? getStoryTitle(parsed.data.storyPath, parsed.data.language)
		: resultFail('Invalid Storyblok story request');
};

export const getProgramsAction = async (input: unknown): Promise<ServiceResult<ISbStoryData<Program>[]>> => {
	const parsed = storyblokLanguageSchema.safeParse(input);

	return parsed.success ? getPrograms(parsed.data) : resultFail('Invalid Storyblok language');
};

export const getCampaignsAction = async (input: unknown): Promise<ServiceResult<ISbStoryData<Campaign>[]>> => {
	const parsed = storyblokLanguageSchema.safeParse(input);

	return parsed.success ? getCampaigns(parsed.data) : resultFail('Invalid Storyblok language');
};

export const getCountriesAction = async (input: unknown): Promise<ServiceResult<ISbStoryData<Country>[]>> => {
	const parsed = storyblokLanguageSchema.safeParse(input);

	return parsed.success ? getCountries(parsed.data) : resultFail('Invalid Storyblok language');
};

export const getCountryByIsoCodeAction = async (input: unknown): Promise<ServiceResult<ISbStoryData<Country>>> => {
	const parsed = storyblokSlugInputSchema.safeParse(input);

	return parsed.success
		? getCountryByIsoCode(parsed.data.slug, parsed.data.language)
		: resultFail('Invalid Storyblok country request');
};

export const getFocusesAction = async (input: unknown): Promise<ServiceResult<ISbStoryData<Focus>[]>> => {
	const parsed = storyblokLanguageSchema.safeParse(input);

	return parsed.success ? getFocuses(parsed.data) : resultFail('Invalid Storyblok language');
};

export const getLocalPartnersAction = async (input: unknown): Promise<ServiceResult<ISbStoryData<LocalPartner>[]>> => {
	const parsed = storyblokLanguageSchema.safeParse(input);

	return parsed.success ? getLocalPartners(parsed.data) : resultFail('Invalid Storyblok language');
};

export const getProgramBySlugAction = async (input: unknown): Promise<ServiceResult<ISbStoryData<Program>>> => {
	const parsed = storyblokSlugInputSchema.safeParse(input);

	return parsed.success
		? getProgramBySlug(parsed.data.slug, parsed.data.language)
		: resultFail('Invalid Storyblok program request');
};

export const getCampaignBySlugAction = async (input: unknown): Promise<ServiceResult<ISbStoryData<Campaign>>> => {
	const parsed = storyblokSlugInputSchema.safeParse(input);

	return parsed.success
		? getCampaignBySlug(parsed.data.slug, parsed.data.language)
		: resultFail('Invalid Storyblok campaign request');
};

export const getFocusBySlugAction = async (input: unknown): Promise<ServiceResult<ISbStoryData<Focus>>> => {
	const parsed = storyblokSlugInputSchema.safeParse(input);

	return parsed.success
		? getFocusBySlug(parsed.data.slug, parsed.data.language)
		: resultFail('Invalid Storyblok focus request');
};

export const getPersonsByUuidsAction = async (input: unknown): Promise<ServiceResult<ISbStoryData<Person>[]>> => {
	const parsed = storyblokStringListInputSchema.safeParse(input);

	return parsed.success
		? getPersonsByUuids(parsed.data.language, parsed.data.values)
		: resultFail('Invalid Storyblok persons request');
};

export const getPersonsByCountryOfficeAction = async (input: unknown): Promise<ServiceResult<ISbStoryData<Person>[]>> => {
	const parsed = storyblokStringListInputSchema.safeParse(input);

	return parsed.success
		? getPersonsByCountryOffice(parsed.data.language, parsed.data.values)
		: resultFail('Invalid Storyblok persons request');
};

export const getAllPersonsAction = async (input: unknown): Promise<ServiceResult<ISbStoryData<Person>[]>> => {
	const parsed = storyblokLanguageSchema.safeParse(input);

	return parsed.success ? getAllPersons(parsed.data) : resultFail('Invalid Storyblok language');
};

export const getPrimaryRoleLabelsAction = async (input: unknown): Promise<ServiceResult<Record<string, string>>> => {
	const parsed = storyblokLanguageSchema.safeParse(input);

	return parsed.success ? getPrimaryRoleLabels(parsed.data) : resultFail('Invalid Storyblok language');
};

export const updateStoryblokPreviewAction = async (input: unknown): Promise<ServiceResult<void>> => {
	const parsed = storyblokPreviewUpdateSchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Missing required preview parameters');
	}
	const { previewRoutePath, previewTimestamp, previewToken, story } = parsed.data;
	if (!verifyStoryblokPreviewToken(previewToken, previewTimestamp)) {
		return resultFail('Invalid preview token');
	}
	setPreviewCache(buildPreviewCacheKey(previewToken, previewRoutePath), story);
	revalidatePath(previewRoutePath);
	await Promise.resolve();

	return resultOk(undefined);
};
