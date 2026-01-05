'use server';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { CountryService } from '@/lib/services/country/country.service';
import type { CountryCreateInput, CountryUpdateInput } from '@/lib/services/country/country.types';
import { revalidatePath } from 'next/cache';

const REVALIDATE_PATH = '/portal/admin/countries';

export async function createCountryAction(input: CountryCreateInput) {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new CountryService();
	const res = await service.create(user.id, input);

	revalidatePath(REVALIDATE_PATH);
	return res;
}

export async function updateCountryAction(input: CountryUpdateInput) {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new CountryService();
	const res = await service.update(user.id, input);

	revalidatePath(REVALIDATE_PATH);
	return res;
}

export async function getCountryAction(id: string) {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new CountryService();
	return service.get(user.id, id);
}
