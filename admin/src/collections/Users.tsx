import { AdditionalFieldDelegate, buildProperties } from 'firecms';
import { USER_FIRESTORE_PATH, User, UserReferralSource } from '../../../shared/src/types';
import { CreateDonationCertificatesAction } from '../actions/CreateDonationCertificatesAction';
import { contributionsCollection } from './Contributions';
import { donationCertificateCollection } from './DonationCertificate';
import { buildAuditedCollection } from './shared';

const FirstNameCol: AdditionalFieldDelegate<User> = {
	id: 'first_name_col',
	name: 'First Name',
	Builder: ({ entity }) => <>{entity.values?.personal?.name}</>,
	dependencies: ['personal'],
};

const LastNameCol: AdditionalFieldDelegate<User> = {
	id: 'last_name_col',
	name: 'Last Name',
	Builder: ({ entity }) => <>{entity.values?.personal?.lastname}</>,
	dependencies: ['personal'],
};

const GenderCol: AdditionalFieldDelegate<User> = {
	id: 'gender_col',
	name: 'Gender',
	Builder: ({ entity }) => <>{entity.values?.personal?.gender}</>,
	dependencies: ['personal'],
};

const PhoneCol: AdditionalFieldDelegate<User> = {
	id: 'phone_col',
	name: 'Phone',
	Builder: ({ entity }) => <>{entity.values?.personal?.phone}</>,
	dependencies: ['personal'],
};

const CountryCol: AdditionalFieldDelegate<User> = {
	id: 'country_col',
	name: 'Country',
	Builder: ({ entity }) => <>{entity.values?.address?.country}</>,
	dependencies: ['address'],
};

const CityCol: AdditionalFieldDelegate<User> = {
	id: 'city_col',
	name: 'City',
	Builder: ({ entity }) => <>{entity.values?.address?.city}</>,
	dependencies: ['address'],
};

const ReferralCol: AdditionalFieldDelegate<User> = {
	id: 'referral_col',
	name: 'Referral',
	Builder: ({ entity }) => <>{entity.values?.personal?.referral}</>,
	dependencies: ['personal'],
};

export const usersCollection = buildAuditedCollection<User>({
	path: USER_FIRESTORE_PATH,
	group: 'Contributors',
	icon: 'VolunteerActivism',
	name: 'Contributors',
	singularName: 'Contributor',
	description: 'Lists all contributors',
	textSearchEnabled: true,
	permissions: () => ({
		edit: true,
		create: true,
		delete: false,
	}),
	additionalFields: [FirstNameCol, LastNameCol, GenderCol, PhoneCol, CountryCol, CityCol, ReferralCol],
	subcollections: [contributionsCollection, donationCertificateCollection],
	Actions: CreateDonationCertificatesAction,
	properties: buildProperties<User>({
		test_user: {
			name: 'Test User',
			dataType: 'boolean',
		},
		email: {
			name: 'Email',
			validation: { required: true },
			dataType: 'string',
		},
		personal: {
			name: 'Personal Info',
			dataType: 'map',
			properties: {
				name: {
					name: 'Name',
					dataType: 'string',
				},
				lastname: {
					name: 'Last Name',
					dataType: 'string',
				},
				gender: {
					name: 'Gender',
					dataType: 'string',
					enumValues: {
						male: 'Male',
						female: 'Female',
						other: 'Other',
						private: 'Private',
					},
				},
				phone: {
					name: 'Phone',
					dataType: 'string',
				},
				company: {
					name: 'Company',
					dataType: 'string',
				},
				referral: {
					name: 'Referral',
					dataType: 'string',
					enumValues: [
						{ id: UserReferralSource.FamilyFriends, label: 'Family or friends' },
						{ id: UserReferralSource.Work, label: 'Work colleagues' },
						{ id: UserReferralSource.SocialMedia, label: 'Social Media' },
						{ id: UserReferralSource.Media, label: 'Media' },
						{ id: UserReferralSource.Presentation, label: 'Presentation' },
						{ id: UserReferralSource.Other, label: 'Other' },
					],
				},
			},
		},
		address: {
			name: 'Address',
			dataType: 'map',
			properties: {
				country: {
					name: 'Country',
					dataType: 'string',
				},
				city: {
					name: 'City',
					dataType: 'string',
				},
				zip: {
					name: 'Zipcode',
					dataType: 'string',
				},
				street: {
					name: 'Street',
					dataType: 'string',
				},
				number: {
					name: 'House Number',
					dataType: 'string',
				},
			},
		},
		institution: {
			name: 'Institutional',
			dataType: 'boolean',
		},
		language: {
			name: 'Language',
			dataType: 'string',
		},
		location: {
			name: 'Location',
			description: 'Living location defined by List of ISO 3166 country codes',
			dataType: 'string',
			validation: {
				required: true,
				length: 2,
				uppercase: true,
			},
		},
		currency: {
			name: 'Currency',
			dataType: 'string',
			enumValues: {
				CHF: 'CHF',
				EUR: 'EUR',
				USD: 'USD',
			},
			validation: { required: true },
		},
		status: {
			name: 'Status',
			dataType: 'number',
			disabled: true,
		},
		stripe_customer_id: {
			name: 'stripe customer id',
			dataType: 'string',
			disabled: true,
		},
	}),
});
