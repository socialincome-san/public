'use server';

import { PayoutStatus } from '@/generated/prisma/enums';
import { getSessionByType } from '@/lib/firebase/current-account';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const confirmPayoutAction = async (payoutId: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.payout.updatePayoutStatus(
		sessionResult.data.id,
		payoutId,
		PayoutStatus.confirmed,
	);
	revalidatePath('/portal/monitoring/payout-confirmation');
	return result;
};

export const contestPayoutAction = async (payoutId: string) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.write.payout.updatePayoutStatus(
		sessionResult.data.id,
		payoutId,
		PayoutStatus.contested,
	);
	revalidatePath('/portal/monitoring/payout-confirmation');
	return result;
};
