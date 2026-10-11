'use server';

import { resultFail, type Result } from '@/lib/result';
import { getSessionByType } from '@/modules/auth/session.service';
import {
	countryCreateInputSchema,
	countryIdSchema,
	countryIsoCodesSchema,
	countryPageIsoCodeSchema,
	countryStatisticsComparisonSchema,
	countryUpdateInputSchema,
} from '@/modules/countries/country.schemas';
import {
	createCountry,
	deleteCountry,
	getCountry,
	getProgramCountryFeasibility,
	updateCountry,
} from '@/modules/countries/country.service';
import type {
	CountryPageStats,
	CountryPayload,
	CountryStatisticRow,
	ProgramCountryFeasibilityView,
	PublicCountryStatsMap,
} from '@/modules/countries/country.types';
import { revalidatePath } from 'next/cache';
import { getCountryPageStats, getCountryStatisticsComparison, getPublicCountryStatsByIsoCodes } from './country.cache';

const REVALIDATE_PATH = '/portal/admin/countries';

export const createCountryAction = async (input: unknown): Promise<Result<CountryPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = countryCreateInputSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	const result = await createCountry(sessionResult.data.id, parsedInput.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const updateCountryAction = async (input: unknown): Promise<Result<CountryPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = countryUpdateInputSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	const result = await updateCountry(sessionResult.data.id, parsedInput.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const deleteCountryAction = async (input: unknown): Promise<Result<{ id: string }>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = countryIdSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	const result = await deleteCountry(sessionResult.data.id, parsedInput.data);
	revalidatePath(REVALIDATE_PATH);

	return result;
};

export const getCountryAction = async (input: unknown): Promise<Result<CountryPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const parsedInput = countryIdSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	return getCountry(sessionResult.data.id, parsedInput.data);
};

export const getProgramCountryFeasibilityAction = async (): Promise<Result<ProgramCountryFeasibilityView>> =>
	getProgramCountryFeasibility();

export const getCountryPageStatsAction = async (input: unknown): Promise<Result<CountryPageStats>> => {
	const parsedInput = countryPageIsoCodeSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid country code');
	}

	return getCountryPageStats(parsedInput.data);
};

export const getPublicCountryStatsByIsoCodesAction = async (input: unknown): Promise<Result<PublicCountryStatsMap>> => {
	const parsedInput = countryIsoCodesSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	return getPublicCountryStatsByIsoCodes(parsedInput.data);
};

export const getCountryStatisticsComparisonAction = async (input: unknown): Promise<Result<CountryStatisticRow[]>> => {
	const parsedInput = countryStatisticsComparisonSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	return getCountryStatisticsComparison(parsedInput.data.countryCode, parsedInput.data.visitorCountryCode);
};
