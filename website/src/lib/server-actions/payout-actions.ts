'use server';

import { getAuthenticatedUserOrThrow } from '@/lib/firebase/current-user';
import { PayoutReadService } from '@/lib/services/payout/payout-read.service';
import { PayoutWriteService } from '@/lib/services/payout/payout-write.service';
import { type PayoutCreateInput, type PayoutUpdateInput } from '@/lib/services/payout/payout.types';
import { RecipientReadService } from '@/lib/services/recipient/recipient-read.service';
import { revalidatePath } from 'next/cache';

export const createPayoutAction = async (input: PayoutCreateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutWriteService();

	const result = await service.create(user.id, input);

	revalidatePath('/portal/delivery/make-payouts');
	return result;
};

export const updatePayoutAction = async (input: PayoutUpdateInput) => {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutWriteService();

	const result = await service.update(user.id, input);

	revalidatePath('/portal/delivery/make-payouts');
	return result;
};

export const getPayoutAction = async (id: string) => {
	const user = await getAuthenticatedUserOrThrow();
	const service = new PayoutReadService();

	return service.get(user.id, id);
};

export const getPayoutRecipientOptionsAction = async () => {
	const user = await getAuthenticatedUserOrThrow();
	const service = new RecipientReadService();

	return service.getEditableRecipientOptions(user.id);
};
