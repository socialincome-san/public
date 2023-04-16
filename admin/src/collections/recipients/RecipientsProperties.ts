import {
	PARTNER_ORGANISATION_FIRESTORE_PATH,
	RecipientMainLanguage,
	RecipientProgramStatus,
} from '@socialincome/shared/src/types';
import { Property } from 'firecms/dist/types/properties';

export const programStatusProperty: Property = {
	name: 'Status',
	dataType: 'string',
	enumValues: [
		{ id: RecipientProgramStatus.Active, label: 'Active Recipient' },
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
			validation: { min: 23200000000, max: 23299999999 },
		},
		has_whatsapp: {
			name: 'WhatsApp',
			dataType: 'boolean',
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
			validation: { min: 23200000000, max: 23299999999 },
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
export const mainLanguageProperty: Property = {
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
	hideFromCollection: true,
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
export const IMUIDProperty: Property = {
	name: 'IM UID',
	dataType: 'string',
	hideFromCollection: true,
};
export const IMLinkProperty: Property = {
	name: 'IM Link',
	dataType: 'string',
	url: true,
};
export const IMInitialProperty: Property = {
	name: 'IM Initial',
	dataType: 'string',
	url: true,
};
export const IMLinkRegularProperty: Property = {
	name: 'IM Regular',
	dataType: 'string',
	url: true,
};
export const IsSuspendedProperty: Property = {
	name: 'Suspended',
	dataType: 'boolean',
	hideFromCollection: true,
};
export const SIStartDateProperty: Property = {
	name: 'Start',
	dataType: 'date',
	mode: 'date',
};
export const TestRecipientProperty: Property = {
	name: 'Test Recipient',
	dataType: 'boolean',
	hideFromCollection: true,
};
