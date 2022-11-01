import { EntityReference } from '@camberi/firecms';

export const USER_FIRESTORE_PATH = 'users';

export type User = {
	personal: {
		name: string;
		lastname: string;
		gender: string;
		company: string;
		phone: string;
		referral: string;
	};
	address: {
		city: string;
		country: string;
		number: string;
		street: string;
		zip: string;
	};
	email: string;
	status: number;
	stripe_customer_id: string;
	test_user: boolean;
	institution: boolean;
	language: string;
	location: string;
	currency: string;
	contributor_organisations?: EntityReference[];
};
