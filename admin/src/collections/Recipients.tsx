import {
	AdditionalFieldDelegate,
	AsyncPreviewComponent,
	buildCollection,
	buildProperties,
	buildProperty,
	StringPropertyPreview,
} from '@camberi/firecms';
import { isUndefined } from 'lodash';
import { PARTNER_ORGANISATION_FIRESTORE_PATH, Recipient, RECIPIENT_FIRESTORE_PATH } from '../../../shared/src/types';
import { getMonthIDs } from '../../../shared/src/utils/date';
import { BuildCollectionProps } from './index';
import { paymentsCollection, paymentStatusMap } from './Payments';

const organisationAdminProperties = buildProperties<Partial<Recipient>>({
	progr_status: {
		name: 'Status',
		dataType: 'string',
		disabled: true,
		enumValues: {
			active: 'Active Recipient',
			waitlisted: 'Waiting List',
			designated: 'Starting Next Payday',
			former: 'Former Recipient',
		},
	},
	om_uid: {
		name: 'OM UID',
		disabled: true,
		dataType: 'number',
	},
	first_name: {
		name: 'First Name',
		validation: { required: true },
		dataType: 'string',
	},
	last_name: {
		name: 'Last Name',
		validation: { required: true },
		dataType: 'string',
	},
	communication_mobile_phone: {
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
	},
	mobile_money_phone: {
		name: 'Separate Orange Money Phone',
		dataType: 'map',
		spreadChildren: true,
		properties: {
			phone: {
				name: 'Orange Money Number',
				dataType: 'number',
			},
			has_whatsapp: {
				name: '# used on Whatsapp',
				dataType: 'boolean',
			},
		},
	},
	gender: {
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
	},
	main_language: {
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
	},
	speaks_english: {
		name: 'Speaks English',
		dataType: 'boolean',
	},
	birth_date: {
		name: 'Birthday',
		dataType: 'date',
		mode: 'date',
	},
	calling_name: {
		name: 'Nickname',
		dataType: 'string',
	},
	profession: {
		name: 'Profession',
		dataType: 'string',
	},
	organisation: {
		name: 'Recommending Organisation',
		hideFromCollection: true,
		// @ts-ignore
		dataType: 'reference',
		path: PARTNER_ORGANISATION_FIRESTORE_PATH,
	},
});

const globalAdminProperties = buildProperties<Recipient>({
	test_recipient: {
		name: 'Test Recipient',
		dataType: 'boolean',
	},
	progr_status: {
		name: 'Status',
		dataType: 'string',
		enumValues: {
			active: 'Active Recipient',
			waitlisted: 'Waiting List',
			designated: 'Starting Next Payday',
			former: 'Former Recipient',
		},
	},
	om_uid: {
		name: 'OM UID',
		dataType: 'number',
	},
	first_name: {
		name: 'First Name',
		validation: { required: true },
		dataType: 'string',
	},
	last_name: {
		name: 'Last Name',
		validation: { required: true },
		dataType: 'string',
	},
	communication_mobile_phone: {
		name: 'Contact Details',
		dataType: 'map',
		spreadChildren: true,
		properties: {
			phone: {
				name: 'Phone Number',
				dataType: 'number',
			},
			equals_mobile_money: {
				name: 'Equals Payment Phone',
				dataType: 'boolean',
			},
			has_whatsapp: {
				name: 'Has Whatsapp',
				dataType: 'boolean',
			},
		},
	},
	mobile_money_phone: {
		name: 'Payment Details',
		validation: { required: true },
		dataType: 'map',
		spreadChildren: true,
		properties: {
			phone: {
				name: 'Phone Number',
				dataType: 'number',
			},
			has_whatsapp: {
				name: 'Has Whatsapp',
				dataType: 'boolean',
			},
		},
	},
	organisation: {
		name: 'Organisation',
		// @ts-ignore
		dataType: 'reference',
		path: PARTNER_ORGANISATION_FIRESTORE_PATH,
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
	si_start_date: {
		name: 'Start',
		dataType: 'date',
		mode: 'date',
	},
	birth_date: {
		name: 'Birthday',
		dataType: 'date',
		mode: 'date',
	},
	profession: {
		name: 'Profession',
		dataType: 'string',
	},
	calling_name: {
		name: 'Nickname',
		dataType: 'string',
	},
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
	main_language: {
		name: 'Main Language',
		dataType: 'string',
		enumValues: {
			krio: 'Krio',
			mende: 'Mende',
			temne: 'Temne',
			limba: 'Limba',
			english: 'English',
			other: 'Other',
		},
	},

	speaks_english: {
		name: 'Speaks English',
		dataType: 'boolean',
	},
	updated_on: buildProperty({
		dataType: 'date',
		name: 'Updated at',
		autoValue: 'on_update',
	}),
	is_suspended: {
		name: 'Suspended',
		dataType: 'boolean',
	},
});

const basicRecipientProperties = buildProperties<Partial<Recipient>>({
	progr_status: {
		name: 'Status',
		dataType: 'string',
		disabled: true,
		enumValues: {
			active: 'Active Recipient',
			waitlisted: 'Waiting List',
			designated: 'Starting Next Payday',
			former: 'Former Recipient',
		},
	},
	first_name: {
		name: 'First Name',
		validation: { required: true },
		dataType: 'string',
	},
	last_name: {
		name: 'Last Name',
		validation: { required: true },
		dataType: 'string',
	},
	om_uid: {
		name: 'OM UID',
		dataType: 'number',
	},
});

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
						values.progr_status = 'waitlisted';
					}
					return values;
				},
			},
			properties: organisationAdminProperties,
			forceFilter: organisations && {
				organisation: ['in', organisations],
			},
			inlineEditing: false,
		});
	}
};

let currentDate = new Date();
let monthIDs = getMonthIDs(currentDate, 3);

let paymentStatusProperty = buildProperty({
	dataType: 'string',
	enumValues: paymentStatusMap,
});

function statusPreview(value: string): React.ReactElement {
	return <StringPropertyPreview property={paymentStatusProperty} value={value} size={'regular'} />;
}

function createMonthColumn(monthID: string, monthLabel: string): AdditionalFieldDelegate<Partial<Recipient>> {
	return {
		id: monthID,
		name: monthLabel,
		builder: ({ entity, context }) => (
			<AsyncPreviewComponent
				builder={context.dataSource
					.fetchEntity({
						path: entity.path + '/' + entity.id + '/payments',
						entityId: monthID,
						collection: paymentsCollection,
					})
					.then((entity) => statusPreview(entity?.values.status || ''))}
			/>
		),
	};
}

const CurrMonthCol = createMonthColumn(monthIDs[0], monthIDs[0] + ' (Current)');
const PrevMonthCol = createMonthColumn(monthIDs[1], monthIDs[1]);
const PrevPrevMonthCol = createMonthColumn(monthIDs[2], monthIDs[2]);

export const buildRecentPaymentsCollection = ({ isGlobalAdmin }: BuildCollectionProps) => {
	const defaultParams = {
		name: 'Payment Confirmations',
		singularName: 'Recipient',
		path: RECIPIENT_FIRESTORE_PATH,
		alias: 'recentPayments',
		group: 'Recipients',
		icon: 'PriceCheck',
		description: 'Payment confirmations of last three month',
		textSearchEnabled: true,
	};
	return buildCollection<Partial<Recipient>>({
		...defaultParams,
		properties: basicRecipientProperties,
		subcollections: [paymentsCollection],
		inlineEditing: true,
		additionalColumns: [CurrMonthCol, PrevMonthCol, PrevPrevMonthCol],
	});
};
