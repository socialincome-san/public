export async function getRecipientService() {
	const { RecipientService } = await import('@/lib/services/recipient/recipient.service');
	return new RecipientService();
}

export async function getFirebaseService() {
	const { FirebaseService } = await import('@/lib/services/firebase/firebase.service');
	return new FirebaseService();
}

export async function getCountryService() {
	const { CountryService } = await import('@/lib/services/country/country.service');
	return new CountryService();
}
