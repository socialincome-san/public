'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { type PayoutCreateInput, type PayoutUpdateInput } from '@/lib/services/payout/payout.types';
import { getServices } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const createPayoutAction = async (input: PayoutCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const result = await getServices().payoutWrite.create(user.id, input);
	revalidatePath('/portal/delivery/make-payouts');
	return result;
};

export const updatePayoutAction = async (input: PayoutUpdateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const result = await getServices().payoutWrite.update(user.id, input);
	revalidatePath('/portal/delivery/make-payouts');
	return result;
};

export const getPayoutAction = async (id: string) => {
	const user = await getAuthenticatedUserOrThrow();
	return getServices().payoutRead.get(user.id, id);
};

export const getPayoutRecipientOptionsAction = async () => {
	const user = await getAuthenticatedUserOrThrow();
	return getServices().recipientRead.getEditableRecipientOptions(user.id);
};
