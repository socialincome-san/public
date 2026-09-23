'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail } from '@/lib/service-result';
import {
	countryCreateInputSchema,
	countryIdSchema,
	countryIsoCodesSchema,
	countryStatisticsComparisonSchema,
	countryUpdateInputSchema,
} from '@/modules/countries/country.schemas';
import {
	createCountry,
	deleteCountry,
	getCountry,
	getCountryStatisticsComparison,
	getProgramCountryFeasibility,
	getPublicCountryStatsByIsoCodes,
	updateCountry,
} from '@/modules/countries/country.service';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/countries';

export const createCountryAction = async (input: unknown) => {
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

export const updateCountryAction = async (input: unknown) => {
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

export const deleteCountryAction = async (input: unknown) => {
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

export const getCountryAction = async (input: unknown) => {
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

export const getProgramCountryFeasibilityAction = async () => getProgramCountryFeasibility();

export const getPublicCountryStatsByIsoCodesAction = async (input: unknown) => {
	const parsedInput = countryIsoCodesSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	return getPublicCountryStatsByIsoCodes(parsedInput.data);
};

export const getCountryStatisticsComparisonAction = async (input: unknown) => {
	const parsedInput = countryStatisticsComparisonSchema.safeParse(input);
	if (!parsedInput.success) {
		return resultFail('Invalid input.');
	}

	return getCountryStatisticsComparison(parsedInput.data.countryCode, parsedInput.data.visitorCountryCode);
};
