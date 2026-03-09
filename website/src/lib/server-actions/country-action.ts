'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { CountryCreateInput, CountryUpdateInput } from '@/lib/services/country/country.types';
import { getServices } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/countries';

export const createCountryAction = async (input: CountryCreateInput) => {
	const user = await getAuthenticatedUserOrRedirect();
	const res = await getServices().countryWrite.create(user.id, input);
	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const updateCountryAction = async (input: CountryUpdateInput) => {
	const user = await getAuthenticatedUserOrRedirect();
	const res = await getServices().countryWrite.update(user.id, input);
	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const deleteCountryAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();
	const res = await getServices().countryWrite.delete(user.id, id);
	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const getCountryAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();
	return getServices().countryRead.get(user.id, id);
};

export const getProgramCountryFeasibilityAction = async () => {
	return getServices().countryRead.getProgramCountryFeasibility();
};

export const createCountryAction = async (input: CountryCreateInput) => {
	const user = await getAuthenticatedUserOrRedirect();

	const res = await countryWriteService.create(user.id, input);

	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const updateCountryAction = async (input: CountryUpdateInput) => {
	const user = await getAuthenticatedUserOrRedirect();

	const res = await countryWriteService.update(user.id, input);

	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const deleteCountryAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();

	const res = await countryWriteService.delete(user.id, id);

	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const getCountryAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();

	return countryReadService.get(user.id, id);
};

export const getProgramCountryFeasibilityAction = async () => {
	return countryReadService.getProgramCountryFeasibility();
};
