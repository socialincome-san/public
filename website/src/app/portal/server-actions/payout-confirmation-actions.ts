'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { PayoutService } from '@socialincome/shared/src/database/services/payout/payout.service';
import { revalidatePath } from 'next/cache';

export async function confirmPayoutAction(payoutId: string) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.confirmPayout(user.id, payoutId);
	if (!result.success) {
		throw new Error(result.error);
	}

	revalidatePath('/portal/delivery/payout-confirmation');
}

export async function contestPayoutAction(payoutId: string) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.contestPayout(user.id, payoutId);
	if (!result.success) {
		throw new Error(result.error);
	}

	revalidatePath('/portal/delivery/payout-confirmation');
}
