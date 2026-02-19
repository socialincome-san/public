'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { CountryService } from '@/lib/services/country/country.service';
import type { CountryCreateInput, CountryUpdateInput } from '@/lib/services/country/country.types';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/countries';
const service = new CountryService();

export const createCountryAction = async (input: CountryCreateInput) => {
	const user = await getAuthenticatedUserOrRedirect();

	const res = await service.create(user.id, input);

	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const updateCountryAction = async (input: CountryUpdateInput) => {
	const user = await getAuthenticatedUserOrRedirect();

	const res = await service.update(user.id, input);

	revalidatePath(REVALIDATE_PATH);
	return res;
};

export const getCountryAction = async (id: string) => {
	const user = await getAuthenticatedUserOrRedirect();

	return service.get(user.id, id);
};

export const getProgramCountryFeasibilityAction = async () => {
	return service.getProgramCountryFeasibility();
};
