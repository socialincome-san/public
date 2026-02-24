'use server';

import { PayoutStatus } from '@/generated/prisma/enums';
import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const confirmPayoutAction = async (payoutId: string) => {
	const user = await getAuthenticatedUserOrThrow();

	const result = await services.payout.updatePayoutStatus(user.id, payoutId, PayoutStatus.confirmed);
	if (!result.success) {
		throw new Error(result.error);
	}

	revalidatePath('/portal/monitoring/payout-confirmation');
};

export const contestPayoutAction = async (payoutId: string) => {
	const user = await getAuthenticatedUserOrThrow();

	const result = await services.payout.updatePayoutStatus(user.id, payoutId, PayoutStatus.contested);
	if (!result.success) {
		throw new Error(result.error);
	}

	revalidatePath('/portal/monitoring/payout-confirmation');
};
