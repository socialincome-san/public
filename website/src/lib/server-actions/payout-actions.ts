'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { type PayoutCreateInput, type PayoutUpdateInput } from '@/lib/services/payout/payout.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const createPayoutAction = async (input: PayoutCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.payout.create(sessionResult.data.id, input);
	revalidatePath('/portal/delivery/make-payouts');
	return result;
};

export const updatePayoutAction = async (input: PayoutUpdateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.payout.update(sessionResult.data.id, input);
	revalidatePath('/portal/delivery/make-payouts');
	return result;
};

export const getPayoutAction = async (id: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.read.payout.get(sessionResult.data.id, id);
};

export const getPayoutRecipientOptionsAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.read.recipient.getEditableRecipientOptions(sessionResult.data.id);
};
