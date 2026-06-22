export type LocalPartnerUpdateUniquenessContext = {
	partnerId: string;
	existingName: string;
	existingSlug: string;
	existingContactId: string;
	existingEmail: string | null;
	existingPhoneId: string | null;
	existingPhoneNumber: string | null;
};
