import { AdditionalFieldDelegate, buildCollection, buildProperties } from '@camberi/firecms';
import { CONTRIBUTOR_ORGANISATION_FIRESTORE_PATH, User, USER_FIRESTORE_PATH } from '@socialincome/shared/types';
import { contributionsCollection } from './Contributions';

const FirstNameCol: AdditionalFieldDelegate<User> = {
	id: 'first_name_col',
	name: 'First Name',
	builder: ({ entity }) => {
		let values = entity.values;
		return ('personal' in values && 'name' in values.personal && values.personal.name) || '';
	},
	dependencies: ['personal'],
};

const LastNameCol: AdditionalFieldDelegate<User> = {
	id: 'last_name_col',
	name: 'Last Name',
	builder: ({ entity }) => {
		let values = entity.values;
		return ('personal' in values && 'lastname' in values.personal && values.personal.lastname) || '';
	},
	dependencies: ['personal'],
};

const GenderCol: AdditionalFieldDelegate<User> = {
	id: 'gender_col',
	name: 'Gender',
	builder: ({ entity }) => {
		let values = entity.values;
		return ('personal' in values && 'gender' in values.personal && values.personal.gender) || '';
	},
	dependencies: ['personal'],
};

const PhoneCol: AdditionalFieldDelegate<User> = {
	id: 'phone_col',
	name: 'Phone',
	builder: ({ entity }) => {
		let values = entity.values;
		return ('personal' in values && 'phone' in values.personal && values.personal.phone) || '';
	},
	dependencies: ['personal'],
};

const CountryCol: AdditionalFieldDelegate<User> = {
	id: 'country_col',
	name: 'Country',
	builder: ({ entity }) => {
		let values = entity.values;
		return ('address' in values && 'country' in values.address && values.address.country) || '';
	},
	dependencies: ['address'],
};

const CityCol: AdditionalFieldDelegate<User> = {
	id: 'city_col',
	name: 'City',
	builder: ({ entity }) => {
		let values = entity.values;
		return ('address' in values && 'city' in values.address && values.address.city) || '';
	},
	dependencies: ['address'],
};

export const usersCollection = buildCollection<User>({
	path: USER_FIRESTORE_PATH,
	group: 'Contributors',
	icon: 'VolunteerActivism',
	name: 'Contributors',
	singularName: 'Contributor',
	description: 'Lists all contributors',
	textSearchEnabled: false,
	permissions: ({ authController }) => ({
		edit: true,
		create: true,
		delete: false,
	}),
	additionalColumns: [FirstNameCol, LastNameCol, GenderCol, PhoneCol, CountryCol, CityCol],
	subcollections: [contributionsCollection],
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
		organisations_contributors: {
			dataType: 'array',
			name: 'Employed by',
			of: {
				dataType: 'reference',
				path: CONTRIBUTOR_ORGANISATION_FIRESTORE_PATH,
			},
		},
		language: {
			name: 'Language',
			dataType: 'string',
		},
		location: {
			name: 'Location',
			dataType: 'string',
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
