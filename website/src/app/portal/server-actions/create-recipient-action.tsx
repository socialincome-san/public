'use server';

import { revalidatePath } from 'next/cache';

export async function createRecipientAction() {
	//todo create / update recipient
	revalidatePath('/portal/management/recipients');
}
