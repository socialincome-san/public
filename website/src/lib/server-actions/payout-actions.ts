'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { type PayoutFormCreateInput, type PayoutFormUpdateInput } from '@/lib/services/payout/payout-form-input';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const PORTAL_DELIVERY_MAKE_PAYOUTS_PATH = '/portal/delivery/make-payouts';
const PORTAL_MANAGEMENT_ONGOING_PAYOUTS_PATH = '/portal/management/ongoing-payouts';
const PORTAL_MANAGEMENT_RECIPIENTS_PATH = '/portal/management/recipients';
const PORTAL_PROGRAM_RECIPIENTS_PATH = '/portal/programs/[programId]/recipients';

export const createPayoutAction = async (input: PayoutFormCreateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.payout.create(sessionResult.data.id, input);
	revalidatePath(PORTAL_DELIVERY_MAKE_PAYOUTS_PATH);

	return result;
};

export const updatePayoutAction = async (input: PayoutFormUpdateInput) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.payout.update(sessionResult.data.id, input);
	revalidatePath(PORTAL_DELIVERY_MAKE_PAYOUTS_PATH);

	return result;
};

export const deletePayoutAction = async (payoutId: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.payout.delete(sessionResult.data.id, payoutId);
	revalidatePath(PORTAL_DELIVERY_MAKE_PAYOUTS_PATH);
	revalidatePath(PORTAL_MANAGEMENT_ONGOING_PAYOUTS_PATH);
	revalidatePath(PORTAL_MANAGEMENT_RECIPIENTS_PATH);
	revalidatePath(PORTAL_PROGRAM_RECIPIENTS_PATH, 'page');

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
