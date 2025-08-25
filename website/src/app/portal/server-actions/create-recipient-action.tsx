'use server';

import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';
import { revalidatePath } from 'next/cache';

export async function createRecipientAction() {
	const recipientService = new RecipientService();
	await recipientService.create({
		userId: 'user-1',
		programId: 'program-1',
		localPartnerId: '',
		startDate: null,
		status: 'active',
	});

	revalidatePath('/portal/management/recipients');
}
