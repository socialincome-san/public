import { EntityReference } from '@camberi/firecms';
import { capitalizeStringIfUppercase } from '../../utils';

export const USER_FIRESTORE_PATH = 'users';

export enum UserStatusKey {
	INITIALIZED = 0, // automatically created through the system
	PROFILE_CREATED = 1, // user submitted registration form
}

export type User = {
	personal?: {
		name?: string;
		lastname?: string;
		gender?: string;
		company?: string;
		phone?: string;
		referral?: string;
	};
	address?: {
		city?: string;
		country?: string;
		number?: string;
		street?: string;
		zip?: string;
	};
	email?: string;
	status?: UserStatusKey;
	stripe_customer_id?: string;
	test_user?: boolean;
	institution?: boolean;
	language?: string;
	location?: string;
	currency?: string;
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
