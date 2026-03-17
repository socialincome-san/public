'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import type { CountryFormCreateInput, CountryFormUpdateInput } from '@/lib/services/country/country-form-input';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/countries';

export const createCountryAction = async (input: CountryFormCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.country.create(sessionResult.data.id, input);
	revalidatePath(REVALIDATE_PATH);

	return res;
};

export const updateCountryAction = async (input: CountryFormUpdateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.country.update(sessionResult.data.id, input);
	revalidatePath(REVALIDATE_PATH);

	return res;
};

export const deleteCountryAction = async (id: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const res = await services.write.country.delete(sessionResult.data.id, id);
	revalidatePath(REVALIDATE_PATH);

	return res;
};

export const getCountryAction = async (id: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	return services.read.country.get(sessionResult.data.id, id);
};

export const getProgramCountryFeasibilityAction = async () => {
	return services.read.country.getProgramCountryFeasibility();
};
