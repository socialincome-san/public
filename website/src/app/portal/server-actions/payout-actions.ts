'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { PayoutService } from '@socialincome/shared/src/database/services/payout/payout.service';
import { YearMonth } from '@socialincome/shared/src/database/services/payout/payout.types';

function toYearMonth(date: Date): YearMonth {
	return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export async function downloadRegistrationCsvAction() {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.downloadRegistrationCSV(user.id);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}

export async function downloadPayoutCsvAction(selectedDate: Date) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();
	const target = toYearMonth(selectedDate);

	const result = await service.downloadPayoutCSV(user.id, target);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}

export async function previewCurrentMonthPayoutsAction(selectedDate: Date) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();
	const target = toYearMonth(selectedDate);

	const result = await service.previewCurrentMonthPayouts(user.id, target);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}

export async function generateCurrentMonthPayoutsAction(selectedDate: Date) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();
	const target = toYearMonth(selectedDate);

	const result = await service.generateCurrentMonthPayouts(user.id, target);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}

export async function previewCompletedRecipientsAction() {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.previewCompletedRecipients(user.id);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}

export async function markCompletedRecipientsAsFormerAction() {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.markCompletedRecipientsAsFormer(user.id);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}
