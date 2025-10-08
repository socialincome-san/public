'use server';

import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';
import { revalidatePath } from 'next/cache';

export async function createRecipientAction() {
	const recipientService = new RecipientService();

	await recipientService.create({
		accountId: 'todo',
		contactId: 'todo',
		programId: 'todo',
		localPartnerId: 'todo',
		status: 'active',
		startDate: new Date(),
		successorName: null,
		termsAccepted: true,
		paymentInformationId: null,
	});

	revalidatePath('/portal/management/recipients');
}
