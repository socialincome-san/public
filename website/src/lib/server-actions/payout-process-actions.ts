'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const generateRegistrationCsvAction = async () => {
	const user = await getAuthenticatedUserOrThrow();

	const result = await services.payoutProcess.generateRegistrationCSV(user.id);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

export const generatePayoutCsvAction = async (selectedDate: Date) => {
	const user = await getAuthenticatedUserOrThrow();

	const result = await services.payoutProcess.generatePayoutCSV(user.id, selectedDate);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

export const previewCurrentMonthPayoutsAction = async (selectedDate: Date) => {
	const user = await getAuthenticatedUserOrThrow();

	const result = await services.payoutProcess.previewCurrentMonthPayouts(user.id, selectedDate);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

export const generateCurrentMonthPayoutsAction = async (selectedDate: Date) => {
	const user = await getAuthenticatedUserOrThrow();

	const result = await services.payoutProcess.generateCurrentMonthPayouts(user.id, selectedDate);

	if (!result.success) {
		throw new Error(result.error);
	}

	revalidatePath('/portal/delivery/make-payouts');

	return result.data;
};
