'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { PayoutService } from '@socialincome/shared/src/database/services/payout/payout.service';

export async function downloadRegistrationCsvAction(selectedDate: Date) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.downloadRegistrationCSV(user.id, selectedDate);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}

export async function downloadPayoutCsvAction(selectedDate: Date) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.downloadPayoutCSV(user.id, selectedDate);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}

export async function generatePayoutsAction(selectedDate: Date) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.generatePayouts(user.id, selectedDate);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}
