import { Chip, Tooltip } from '@mui/material';
import {
	RECIPIENT_FIRESTORE_PATH,
	Recipient,
	calcFinalPaymentDate,
	calcPaymentsLeft,
} from '@socialincome/shared/src/types/recipient';
import { toDateTime } from '@socialincome/shared/src/utils/date';
import { AdditionalFieldDelegate, buildProperties } from 'firecms';
import { EntityCollection, PropertiesOrBuilders } from 'firecms/dist/types';
import { paymentsCollection } from '../Payments';
import { buildAuditedCollection } from '../shared';
import { buildSurveysCollection } from '../surveys/Surveys';
import {
	InstagramProperty,
	SIStartDateProperty,
	TestRecipientProperty,
	TwitterProperty,
	birthDateProperty,
	callingNameProperty,
	communicationMobilePhoneProperty,
	emailProperty,
	firstNameProperty,
	genderProperty,
	lastNameProperty,
	mainLanguageProperty,
	mobileMoneyPhoneProperty,
	orangeMoneyUIDProperty,
	organisationProperty,
	professionProperty,
	programStatusProperty,
	successorProperty,
} from './RecipientsProperties';

export const PaymentsLeft: AdditionalFieldDelegate<Partial<Recipient>> = {
	id: 'payments_left',
	name: 'Payments Left',
	Builder: ({ entity }) => {
		const finalPaymentDate = entity.values.si_start_date
			? calcFinalPaymentDate(toDateTime(entity.values.si_start_date))
			: undefined;
		const paymentsLeft = finalPaymentDate ? calcPaymentsLeft(finalPaymentDate) : undefined;
		if (paymentsLeft && finalPaymentDate) {
			return (
				<Tooltip title={'Last Payment Date ' + finalPaymentDate.toFormat('dd/MM/yyyy')}>
					<Chip
						size={'small'}
						color={paymentsLeft < 0 ? 'info' : paymentsLeft <= 1 ? 'error' : paymentsLeft <= 3 ? 'warning' : 'success'}
						label={paymentsLeft < 0 ? 'none' : paymentsLeft + ' payment(s) left'}
					/>
				</Tooltip>
			);
		} else {
			return <></>;
		}
	},
	dependencies: ['si_start_date'],
};

const baseProperties: PropertiesOrBuilders<Partial<Recipient>> = {
	om_uid: orangeMoneyUIDProperty,
	first_name: firstNameProperty,
	last_name: lastNameProperty,
	progr_status: programStatusProperty,
	organisation: organisationProperty,
	mobile_money_phone: mobileMoneyPhoneProperty,
	calling_name: callingNameProperty,
	communication_mobile_phone: communicationMobilePhoneProperty,
	gender: genderProperty,
	birth_date: birthDateProperty,
	main_language: mainLanguageProperty,
	profession: professionProperty,
};

export const buildRecipientsCollection = () => {
	const collection: EntityCollection<Partial<Recipient>> = {
		additionalFields: [PaymentsLeft],
		inlineEditing: false,
		defaultSize: 'xs',
		description: 'List of people who receive a Social Income',
		group: 'Recipients',
		icon: 'RememberMeTwoTone',
		name: 'Recipients',
		path: RECIPIENT_FIRESTORE_PATH,
		singularName: 'Recipient',
		textSearchEnabled: true,
		properties: buildProperties<Partial<Recipient>>({
			...baseProperties,
			email: emailProperty,
			insta_handle: InstagramProperty,
			twitter_handle: TwitterProperty,
			successor: successorProperty,
			si_start_date: SIStartDateProperty,
			test_recipient: TestRecipientProperty,
		}),
		subcollections: [paymentsCollection, buildSurveysCollection()],
	};
	return buildAuditedCollection<Partial<Recipient>>(collection);
};
