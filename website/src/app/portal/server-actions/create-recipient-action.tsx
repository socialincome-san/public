'use server';

import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import { revalidatePath } from 'next/cache';

// todo: use upsert for same server action for create and update
export async function createRecipientAction(formData: any) {
	console.log(formData);

	const recipientService = new RecipientService();
	const userService = new UserService();

	const userData = {
		email: formData.email,
		firstName: formData.firstName,
		lastName: formData.lastName,
		authUserId: null,
		gender: formData.gender,
		company: formData.company,
		referral: null,
		paymentReferenceId: null,
		stripeCustomerId: null,
		institution: false,
		language: formData.language,
		currency: formData.currency,
		addressStreet: formData.addressStreet,
		addressNumber: formData.addressNumber,
		addressCity: formData.addressCity,
		addressZip: formData.addressZip,
		addressCountry: formData.addressCountry,
		organizationId: null,
		birthDate: formData.birthDate,
		communicationPhone: formData.communicationPhone,
		communicationPhoneHasWhatsapp: formData.communicationPhoneHasWhatsapp,
		communicationPhoneWhatsappActivated: formData.communicationPhoneWhatsappActivated,
		mobileMoneyPhone: formData.mobileMoneyPhone,
		mobileMoneyPhoneHasWhatsapp: formData.mobileMoneyPhoneHasWhatsapp,
		instaHandle: formData.instaHandle,
		twitterHandle: formData.twitterHandle,
		profession: formData.profession,
		callingName: formData.callingName,
		omUid: formData.omUid,
		role: 'user' as any, // todo:  Replace 'any' with the actual UserRole enum if imported, e.g. UserRole.User
	};

	const result = await userService.create({
		...userData,
	});

	if (result.success) {
		const recipientResult = await recipientService.create({
			userId: result.data.id,
			programId: 'program-1',
			localPartnerId: 'local-partner-4',
			startDate: null,
			status: 'active',
		});

		console.log(recipientResult);
	} else {
		console.log(result);
	}

	revalidatePath('/portal/management/recipients');
}
