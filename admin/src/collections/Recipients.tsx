import { buildCollection, buildProperties } from '@camberi/firecms';
import { PropertiesOrBuilders } from '@camberi/firecms/dist/types';
import { Property } from '@camberi/firecms/dist/types/properties';
import { isUndefined } from 'lodash';
import {
	PARTNER_ORGANISATION_FIRESTORE_PATH,
	Recipient,
	RecipientProgramStatus,
	RECIPIENT_FIRESTORE_PATH,
} from '../../../shared/src/types';
import { BuildCollectionProps, paymentsCollection } from './index';

export const programStatusProperty: Property = {
	name: 'Status',
	dataType: 'string',
	disabled: true,
	enumValues: [
		{ id: RecipientProgramStatus.Active, label: 'Active Recipient' },
		{ id: RecipientProgramStatus.Waitlisted, label: 'Waiting List' },
		{ id: RecipientProgramStatus.Designated, label: 'Starting Next Payday' },
		{ id: RecipientProgramStatus.Former, label: 'Former Recipient' },
	],
};

export const orangeMoneyUIDProperty: Property = {
	name: 'Orange Money UID',
	dataType: 'number',
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

const communicationMobilePhoneProperty: Property = {
	name: 'Contact Phone',
	validation: { required: true },
	dataType: 'map',
	spreadChildren: true,
	properties: {
		phone: {
			name: 'Phone Number',
			dataType: 'number',
		},
		equals_mobile_money: {
			name: '# used for Orange Money',
			dataType: 'boolean',
		},
		has_whatsapp: {
			name: '# used on WhatsApp',
			dataType: 'boolean',
		},
	},
};

const mobileMoneyPhoneProperty: Property = {
	name: 'Separate Orange Money Phone',
	dataType: 'map',
	spreadChildren: true,
	properties: {
		phone: {
			name: 'Orange Money Number',
			dataType: 'number',
			validation: { required: true, min: 23200000000, max: 23299999999 },
		},
		has_whatsapp: {
			name: '# used on Whatsapp',
			dataType: 'boolean',
		},
	},
};

const genderProperty: Property = {
	name: 'Gender',
	dataType: 'string',
	longDescription: 'Gender of recipient',
	validation: { required: true },
	enumValues: {
		male: 'Male',
		female: 'Female',
		other: 'Other',
		private: 'Private',
	},
};

const mainLanguageProperty: Property = {
	name: 'First Language',
	dataType: 'string',
	validation: { required: true },
	enumValues: {
		krio: 'Krio',
		mende: 'Mende',
		temne: 'Temne',
		limba: 'Limba',
		english: 'English',
		other: 'Other',
	},
};

const speaksEnglishProperty: Property = {
	name: 'Speaks English',
	dataType: 'boolean',
};

const birthDateProperty: Property = {
	name: 'Birthday',
	dataType: 'date',
	mode: 'date',
};

const callingNameProperty: Property = {
	name: 'Nickname',
	dataType: 'string',
};

const professionProperty: Property = {
	name: 'Profession',
	dataType: 'string',
};

const organisationProperty: Property = {
	name: 'Recommending Organisation',
	dataType: 'reference',
	path: PARTNER_ORGANISATION_FIRESTORE_PATH,
};

const baseProperties: PropertiesOrBuilders<Partial<Recipient>> = {
	progr_status: { ...programStatusProperty, disabled: true },
	om_uid: { ...orangeMoneyUIDProperty, disabled: true },
	first_name: firstNameProperty,
	last_name: lastNameProperty,
	communication_mobile_phone: communicationMobilePhoneProperty,
	mobile_money_phone: mobileMoneyPhoneProperty,
	gender: genderProperty,
	main_language: mainLanguageProperty,
	speaks_english: speaksEnglishProperty,
	birth_date: birthDateProperty,
	calling_name: callingNameProperty,
	profession: professionProperty,
	organisation: { ...organisationProperty, hideFromCollection: true },
};
const organisationAdminProperties = buildProperties<Partial<Recipient>>(baseProperties);

const allProps: PropertiesOrBuilders<Recipient> = {
	progr_status: programStatusProperty,
	om_uid: orangeMoneyUIDProperty,
	first_name: firstNameProperty,
	last_name: lastNameProperty,
	// @ts-ignore
	communication_mobile_phone: communicationMobilePhoneProperty,
	// @ts-ignore
	mobile_money_phone: mobileMoneyPhoneProperty,
	gender: genderProperty,
	main_language: mainLanguageProperty,
	speaks_english: speaksEnglishProperty,
	birth_date: birthDateProperty,
	calling_name: callingNameProperty,
	profession: professionProperty,
	organisation: organisationProperty,
	email: {
		name: 'Email',
		dataType: 'string',
	},
	insta_handle: {
		name: 'Instagram',
		dataType: 'string',
	},
	twitter_handle: {
		name: 'Twitter',
		dataType: 'string',
	},
	im_uid: {
		name: 'IM UID',
		dataType: 'string',
	},
	im_link: {
		name: 'IM Link',
		dataType: 'string',
		url: true,
	},
	im_link_initial: {
		name: 'IM Initial',
		dataType: 'string',
		url: true,
	},
	im_link_regular: {
		name: 'IM Regular',
		dataType: 'string',
		url: true,
	},
	is_suspended: {
		name: 'Suspended',
		dataType: 'boolean',
	},
	si_start_date: {
		name: 'Start',
		dataType: 'date',
		mode: 'date',
	},
	test_recipient: {
		name: 'Test Recipient',
		dataType: 'boolean',
	},
	updated_on: {
		dataType: 'date',
		name: 'Updated at',
		autoValue: 'on_update',
	},
};
const globalAdminProperties = buildProperties<Recipient>(allProps);

export const buildRecipientsCollection = ({ isGlobalAdmin, organisations }: BuildCollectionProps) => {
	const defaultParams = {
		name: 'Recipients',
		singularName: 'Recipient',
		path: RECIPIENT_FIRESTORE_PATH,
		alias: 'recipients',
		group: 'Recipients',
		icon: 'RememberMeTwoTone',
		description: 'Lists of people, who receive a Social Income',
		textSearchEnabled: true,
	};
	if (isGlobalAdmin) {
		return buildCollection<Partial<Recipient>>({
			...defaultParams,
			properties: globalAdminProperties,
			subcollections: [paymentsCollection],
			inlineEditing: false,
			initialSort: ['om_uid', 'desc'],
		});
	} else {
		return buildCollection<Partial<Recipient>>({
			...defaultParams,
			callbacks: {
				onPreSave: ({ previousValues, values }) => {
					if (!values?.organisation?.id || organisations?.map((o) => o.id).indexOf(values.organisation.id) === -1) {
						throw Error('Please select a valid organisation.');
					}
					if (isUndefined(previousValues)) {
						values.progr_status = RecipientProgramStatus.Waitlisted;
					}
					return values;
				},
			},
			properties: organisationAdminProperties,
			forceFilter: {
				organisation: ['in', organisations || []],
			},
			inlineEditing: false,
			initialSort: ['om_uid', 'desc'],
		});
	}
};
