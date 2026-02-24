'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { type PayoutCreateInput, type PayoutUpdateInput } from '@/lib/services/payout/payout.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const createPayoutAction = async (input: PayoutCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();

	const result = await services.payout.create(user.id, input);

	revalidatePath('/portal/delivery/make-payouts');
	return result;
};

export const updatePayoutAction = async (input: PayoutUpdateInput) => {
	const user = await getAuthenticatedUserOrThrow();

	const result = await services.payout.update(user.id, input);

	revalidatePath('/portal/delivery/make-payouts');
	return result;
};

export const getPayoutAction = async (id: string) => {
	const user = await getAuthenticatedUserOrThrow();

	return services.payout.get(user.id, id);
};

export const getPayoutRecipientOptionsAction = async () => {
	const user = await getAuthenticatedUserOrThrow();

	return services.recipient.getEditableRecipientOptions(user.id);
};
