'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { PayoutStatus } from '@prisma/client';
import { PayoutService } from '@socialincome/shared/src/database/services/payout/payout.service';
import { revalidatePath } from 'next/cache';

export async function confirmPayoutAction(payoutId: string) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.updatePayoutStatus(user.id, payoutId, PayoutStatus.confirmed);
	if (!result.success) {
		throw new Error(result.error);
	}

	revalidatePath('/portal/monitoring/payout-confirmation');
}

export async function contestPayoutAction(payoutId: string) {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutService();

	const result = await service.updatePayoutStatus(user.id, payoutId, PayoutStatus.contested);
	if (!result.success) {
		throw new Error(result.error);
	}

	revalidatePath('/portal/monitoring/payout-confirmation');
}
