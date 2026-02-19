'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { revalidatePath } from 'next/cache';
import { PayoutProcessService } from '../services/payout-process/payout-process.service';

const service = new PayoutProcessService();

export async function generateRegistrationCsvAction() {
	const user = await getAuthenticatedUserOrThrow();

	const result = await service.generateRegistrationCSV(user.id);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}

export async function generatePayoutCsvAction(selectedDate: Date) {
	const user = await getAuthenticatedUserOrThrow();

	const result = await service.generatePayoutCSV(user.id, selectedDate);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}

export async function previewCurrentMonthPayoutsAction(selectedDate: Date) {
	const user = await getAuthenticatedUserOrThrow();

	const result = await service.previewCurrentMonthPayouts(user.id, selectedDate);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}

export async function generateCurrentMonthPayoutsAction(selectedDate: Date) {
	const user = await getAuthenticatedUserOrThrow();

	const result = await service.generateCurrentMonthPayouts(user.id, selectedDate);

	if (!result.success) {
		throw new Error(result.error);
	}

	revalidatePath('/portal/delivery/make-payouts');

	return result.data;
}
