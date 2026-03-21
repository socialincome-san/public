export type CandidateUpdateUniquenessContext = {
	existingContactId: string;
	existingEmail: string | null;
	existingContactPhoneId: string | null;
	existingContactPhoneNumber: string | null;
	existingPaymentInformationId: string | null;
	existingPaymentCode: string | null;
	existingPaymentPhoneId: string | null;
	existingPaymentPhoneNumber: string | null;
};
