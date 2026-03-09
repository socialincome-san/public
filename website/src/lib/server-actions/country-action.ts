'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { CountryCreateInput, CountryUpdateInput } from '@/lib/services/country/country.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/countries';

export const createCountryAction = async (input: CountryCreateInput) => {
	const user = await getAuthenticatedUserOrRedirect();
	const res = await services.write.country.create(user.id, input);
	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const updateCountryAction = async (input: CountryUpdateInput) => {
	const user = await getAuthenticatedUserOrRedirect();
	const res = await services.write.country.update(user.id, input);
	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const deleteCountryAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();
	const res = await services.write.country.delete(user.id, id);
	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const getCountryAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();
	return services.read.country.get(user.id, id);
};

export const getProgramCountryFeasibilityAction = async () => {
	return services.read.country.getProgramCountryFeasibility();
};
