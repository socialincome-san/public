export async function getRecipientService() {
	const { RecipientService } = await import('@/lib/services/recipient/recipient.service');
	return new RecipientService();
}

export async function getFirebaseAdminService() {
	const { FirebaseAdminService } = await import('@/lib/services/firebase/firebase-admin.service');
	return new FirebaseAdminService();
}

export async function getCountryService() {
	const { CountryService } = await import('@/lib/services/country/country.service');
	return new CountryService();
}
