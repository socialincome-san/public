export const getRecipientService = async () => {
	const { RecipientService } = await import('@/lib/services/recipient/recipient.service');
	return new RecipientService();
};

export const getCandidateService = async () => {
	const { CandidateService } = await import('@/lib/services/candidate/candidate.service');
	return new CandidateService();
};

export const getFirebaseAdminService = async () => {
	const { FirebaseAdminService } = await import('@/lib/services/firebase/firebase-admin.service');
	return new FirebaseAdminService();
};

export const getCountryService = async () => {
	const { CountryService } = await import('@/lib/services/country/country.service');
	return new CountryService();
};

export const getLocalPartnerService = async () => {
	const { LocalPartnerService } = await import('@/lib/services/local-partner/local-partner.service');
	return new LocalPartnerService();
};
