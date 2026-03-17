import { CountryCode } from '@/generated/prisma/client';

export type ContactAddressFields = {
	street: string | null;
	number: string | null;
	city: string | null;
	zip: string | null;
	country: string | null;
};

export type BuildPhoneWriteOperationParams = {
	nextPhoneNumber: string | undefined;
	nextHasWhatsApp: boolean;
	currentPhoneId: string | undefined;
	currentPhoneNumber: string | undefined;
};

export type BuildAddressWriteOperationParams = {
	addressInput:
		| {
				street: string;
				number: string;
				city: string;
				zip: string;
				country: CountryCode | null;
		  }
		| undefined;
	currentAddressId: string | undefined;
};
