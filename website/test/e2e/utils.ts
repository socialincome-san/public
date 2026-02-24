export const getRecipientService = async () => {
	const { services } = await import('@/lib/services/services');
	return services.recipient;
};

export const getCandidateService = async () => {
	const { services } = await import('@/lib/services/services');
	return services.candidate;
};

export const getFirebaseAdminService = async () => {
	const { services } = await import('@/lib/services/services');
	return services.firebaseAdmin;
};

export const getCountryService = async () => {
	const { services } = await import('@/lib/services/services');
	return services.country;
};

export const getLocalPartnerService = async () => {
	const { services } = await import('@/lib/services/services');
	return services.localPartner;
};
