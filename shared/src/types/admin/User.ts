import { EntityReference } from 'firecms';
import { capitalizeStringIfUppercase } from '../../utils/strings';
import { LanguageCode } from './Language';

export const USER_FIRESTORE_PATH = 'users';

export enum UserStatusKey {
	INITIALIZED = 0, // automatically created through the system
	PROFILE_CREATED = 1, // user submitted registration form
}

export enum UserReferralSource {
	FamilyFriends = 'familyfriends',
	Work = 'work',
	SocialMedia = 'socialmedia',
	Media = 'media',
	Presentation = 'presentation',
	Other = 'other',
}

export type UserAddress = {
	city?: string;
	country?: string; // TODO: proper typing
	number?: string;
	street?: string;
	zip?: string; // TODO: proper typing (number?)
};

export type User = {
	authUserId?: string;
	personal?: {
		name?: string; // TODO: discuss if should be renamed to firstname
		lastname?: string;
		gender?: 'male' | 'female' | 'other';
		company?: string;
		phone?: string;
		referral?: UserReferralSource;
	};
	address?: UserAddress;
	email: string;
	status?: UserStatusKey;
	stripe_customer_id?: string;
	test_user?: boolean; // TODO: discuss if still needed
	institution?: boolean;
	language?: LanguageCode;
	location?: string; // TODO: discuss if still needed
	currency?: string | null; // TODO: proper typing
	contributor_organisations?: EntityReference[];
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
