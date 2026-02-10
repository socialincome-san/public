'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { PayoutService } from '@/lib/services/payout/payout.service';
import { type PayoutCreateInput, type PayoutUpdateInput } from '@/lib/services/payout/payout.types';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import { revalidatePath } from 'next/cache';

export async function generateRegistrationCsvAction() {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.generateRegistrationCSV(user.id);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}

export async function generatePayoutCsvAction(selectedDate: Date) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.generatePayoutCSV(user.id, selectedDate);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}

export async function previewCurrentMonthPayoutsAction(selectedDate: Date) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.previewCurrentMonthPayouts(user.id, selectedDate);

	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
}

export async function generateCurrentMonthPayoutsAction(selectedDate: Date) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.generateCurrentMonthPayouts(user.id, selectedDate);

	if (!result.success) {
		throw new Error(result.error);
	}

	revalidatePath('/portal/delivery/make-payouts');

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

export async function createPayoutAction(input: PayoutCreateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.create(user.id, input);

	revalidatePath('/portal/delivery/make-payouts');
	return result;
}

export async function updatePayoutAction(input: PayoutUpdateInput) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.update(user.id, input);

	revalidatePath('/portal/delivery/make-payouts');
	return result;
}

export async function getPayoutAction(id: string) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	return service.get(user.id, id);
}

export async function getPayoutRecipientOptionsAction() {
	const user = await getAuthenticatedUserOrThrow();
	const service = new RecipientService();

	return service.getEditableRecipientOptions(user.id);
}
