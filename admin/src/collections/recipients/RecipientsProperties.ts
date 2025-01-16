import { PARTNER_ORGANISATION_FIRESTORE_PATH } from '@socialincome/shared/src/types/partner-organisation';
import { RecipientMainLanguage, RecipientProgramStatus } from '@socialincome/shared/src/types/recipient';
import { Property, StringProperty } from 'firecms/dist/types/properties';

export const programStatusProperty: Property = {
	name: 'Status',
	dataType: 'string',
	enumValues: [
		{ id: RecipientProgramStatus.Active, label: 'Active Recipient' },
		{ id: RecipientProgramStatus.Suspended, label: 'Suspended' },
		{ id: RecipientProgramStatus.Waitlisted, label: 'Waiting List' },
		{ id: RecipientProgramStatus.Designated, label: 'Starting Next Payday' },
		{ id: RecipientProgramStatus.Former, label: 'Former Recipient' },
	],
};

export const orangeMoneyUIDProperty: Property = {
	name: 'OM ID',
	dataType: 'number',
	columnWidth: 70,
};

export const firstNameProperty: Property = {
	name: 'First Name',
	validation: { required: true },
	dataType: 'string',
};

export const lastNameProperty: Property = {
	name: 'Last Name',
	validation: { required: true },
	dataType: 'string',
};

export const communicationMobilePhoneProperty: Property = {
	name: 'Contact Phone',
	dataType: 'map',
	hideFromCollection: true,
	properties: {
		phone: {
			name: 'Phone Number',
			dataType: 'number',
			validation: { min: 10000, max: 999999999999999, integer: true },
		},
		has_whatsapp: {
			name: 'WhatsApp',
			dataType: 'boolean',
		},
		whatsapp_activated: {
			name: 'WhatsApp activated',
			dataType: 'boolean',
			hideFromCollection: true,
			readOnly: true,
			defaultValue: false,
		},
	},
};

export const mobileMoneyPhoneProperty: Property = {
	name: 'Orange Money Phone Number',
	dataType: 'map',
	hideFromCollection: true,
	properties: {
		phone: {
			name: 'Orange Money Number',
			dataType: 'number',
			validation: { min: 10000, max: 999999999999999, integer: true },
		},
		has_whatsapp: {
			name: 'WhatsApp',
			dataType: 'boolean',
		},
	},
};

export const genderProperty: Property = {
	name: 'Gender',
	dataType: 'string',
	longDescription: 'Gender of recipient',
	validation: { required: true },
	columnWidth: 75,
	enumValues: {
		male: 'Male',
		female: 'Female',
		other: 'Other',
		private: 'Private',
	},
};

export const mainLanguageProperty: StringProperty = {
	name: 'Preferred Language',
	dataType: 'string',
	validation: { required: true },
	enumValues: [
		{ id: RecipientMainLanguage.Krio, label: 'Krio' },
		{ id: RecipientMainLanguage.English, label: 'English' },
	],
};

export const birthDateProperty: Property = {
	name: 'Birthday',
	longDescription: 'Date of birth',
	dataType: 'date',
	mode: 'date',
};

export const callingNameProperty: Property = {
	name: 'Nickname',
	dataType: 'string',
	hideFromCollection: true,
};

export const professionProperty: Property = {
	name: 'Profession',
	dataType: 'string',
	hideFromCollection: true,
};

export const organisationProperty: Property = {
	name: 'Recommending Organisation',
	dataType: 'reference',
	path: PARTNER_ORGANISATION_FIRESTORE_PATH,
};
export const emailProperty: Property = {
	name: 'Email',
	dataType: 'string',
	email: true,
	hideFromCollection: true,
	validation: { unique: true },
};

export const InstagramProperty: Property = {
	name: 'Instagram',
	dataType: 'string',
	hideFromCollection: true,
};

export const TwitterProperty: Property = {
	name: 'Twitter',
	dataType: 'string',
	hideFromCollection: true,
};

export const successorProperty: Property = {
	name: 'Successor',
	dataType: 'string',
	hideFromCollection: true,
};

export const SIStartDateProperty: Property = {
	name: 'Start Date',
	longDescription: 'Starting date',
	dataType: 'date',
	mode: 'date',
};

export const TestRecipientProperty: Property = {
	name: 'Test Recipient',
	dataType: 'boolean',
	hideFromCollection: true,
};
