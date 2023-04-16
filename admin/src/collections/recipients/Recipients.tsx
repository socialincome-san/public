import { AdditionalFieldDelegate, buildProperties } from 'firecms';
import { EntityCollection, PropertiesOrBuilders } from 'firecms/dist/types';

import { Chip, Tooltip } from '@mui/material';
import {
	calcLastPaymentDate,
	calcPaymentsLeft,
	Recipient,
	RECIPIENT_FIRESTORE_PATH,
} from '@socialincome/shared/src/types';
import { PaymentProcessAction } from '../../actions/PaymentProcessAction';
import { messagesCollection, paymentsCollection } from '../index';
import { buildAuditedCollection } from '../shared';
import {
	birthDateProperty,
	callingNameProperty,
	communicationMobilePhoneProperty,
	emailProperty,
	firstNameProperty,
	genderProperty,
	IMInitialProperty,
	IMLinkProperty,
	IMLinkRegularProperty,
	IMUIDProperty,
	InstagramProperty,
	IsSuspendedProperty,
	lastNameProperty,
	mainLanguageProperty,
	mobileMoneyPhoneProperty,
	orangeMoneyUIDProperty,
	organisationProperty,
	professionProperty,
	programStatusProperty,
	SIStartDateProperty,
	TestRecipientProperty,
	TwitterProperty,
} from './RecipientsProperties';

export const PaymentsLeft: AdditionalFieldDelegate<Partial<Recipient>> = {
	id: 'payments_left',
	name: 'Payments Left',
	Builder: ({ entity }) => {
		const lastPaymentDate = entity.values.si_start_date
			? calcLastPaymentDate(entity.values.si_start_date as Date)
			: undefined;
		const paymentsLeft = lastPaymentDate ? calcPaymentsLeft(lastPaymentDate) : undefined;
		if (paymentsLeft && lastPaymentDate) {
			return (
				<Tooltip title={'Last Payment Date ' + lastPaymentDate.toFormat('yyyy-MM-dd')}>
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
		// inlineEditing: false,
		defaultSize: 'xs',
		description: 'Lists of people, who receive a Social Income',
		group: 'Recipients',
		icon: 'RememberMeTwoTone',
		name: 'Recipients',
		path: RECIPIENT_FIRESTORE_PATH,
		singularName: 'Recipient',
		textSearchEnabled: true,
		Actions: PaymentProcessAction,
		properties: buildProperties<Partial<Recipient>>({
			...baseProperties,
			email: emailProperty,
			insta_handle: InstagramProperty,
			twitter_handle: TwitterProperty,
			im_uid: IMUIDProperty,
			im_link: IMLinkProperty,
			im_link_initial: IMInitialProperty,
			im_link_regular: IMLinkRegularProperty,
			is_suspended: IsSuspendedProperty,
			si_start_date: SIStartDateProperty,
			test_recipient: TestRecipientProperty,
		}),
		subcollections: [paymentsCollection, messagesCollection],
	};
	return buildAuditedCollection<Partial<Recipient>>(collection);
};
