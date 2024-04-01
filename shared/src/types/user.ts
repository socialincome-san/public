import { EntityReference } from 'firecms';
import { capitalizeStringIfUppercase } from '../utils/strings';
import { CountryCode } from './country';
import { Currency } from './currency';
import { Employer } from './employers';
import { LanguageCode } from './language';

export const USER_FIRESTORE_PATH = 'users';

export const GENDER_OPTIONS = ['male', 'female', 'other', 'private'] as const;
export type Gender = (typeof GENDER_OPTIONS)[number];

export enum UserReferralSource {
	FamilyFriends = 'familyfriends',
	Work = 'work',
	SocialMedia = 'socialmedia',
	Media = 'media',
	Presentation = 'presentation',
	Other = 'other',
}

export type UserAddress = {
	country: CountryCode;
	street?: string;
	number?: string;
	city?: string;
	zip?: number;
};

export type User = {
	auth_user_id?: string;
	personal?: {
		name?: string; // TODO: discuss if should be renamed to firstname
		lastname?: string;
		gender?: Gender;
		company?: string;
		phone?: string;
		referral?: UserReferralSource;
	};
	address: UserAddress;
	email: string;
	payment_reference_id: number; // used to identify user in wire transfer
	stripe_customer_id?: string;
	test_user?: boolean; // TODO: discuss if still needed
	institution?: boolean;
	language?: LanguageCode;
	currency?: Currency;
	contributor_organisations?: EntityReference[];
	employers?: Employer[];
};

export const splitName = (name: string) => {
	const stripeNames = name.split(' ');
	if (stripeNames.length >= 2) {
		return {
			lastname: capitalizeStringIfUppercase(stripeNames.pop()!),
			firstname: capitalizeStringIfUppercase(stripeNames.join(' ')),
		};
	} else {
		return {
			lastname: capitalizeStringIfUppercase(name),
			firstname: '',
		};
	}
};
