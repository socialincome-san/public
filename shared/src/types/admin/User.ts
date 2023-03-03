import { EntityReference } from '@camberi/firecms';
import { capitalizeStringIfUppercase } from '../../utils/strings';

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
	personal?: {
		name?: string; // TODO: discuss if should be renamed to firstname
		lastname?: string;
		gender?: string; // TODO: proper typing
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
	language?: string; // TODO: proper typing
	location?: string; // TODO: discuss if still needed
	currency?: string; // TODO: proper typing
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
