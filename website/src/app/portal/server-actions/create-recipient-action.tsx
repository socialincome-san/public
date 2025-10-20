'use server';

import { revalidatePath } from 'next/cache';

export async function createRecipientAction() {
	// const recipientService = new RecipientService();

	// await recipientService.create({
	// 	accountId: 'todo',
	// 	contactId: 'todo',
	// 	programId: 'todo',
	// 	localPartnerId: 'todo',
	// 	status: 'active',
	// 	startDate: new Date(),
	// 	successorName: null,
	// 	termsAccepted: true,
	// 	paymentInformationId: null,
	// });

	//todo create / update recipient
	revalidatePath('/portal/management/recipients');
}
