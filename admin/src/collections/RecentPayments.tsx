import {
	AdditionalFieldDelegate,
	AsyncPreviewComponent,
	buildCollection,
	buildProperties,
	buildProperty,
	StringPropertyPreview,
} from '@camberi/firecms';
import { Recipient, RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import { getMonthIDs } from '@socialincome/shared/src/utils/date';
import { CreateOrangeMoneyCSVAction } from '../actions/CreateOrangeMoneyCSVAction';
import { paymentsCollection, paymentStatusMap } from './Payments';
import { firstNameProperty, lastNameProperty, orangeMoneyUIDProperty, programStatusProperty } from './Recipients';

const basicRecipientProperties = buildProperties<Partial<Recipient>>({
	progr_status: programStatusProperty,
	first_name: firstNameProperty,
	last_name: lastNameProperty,
	om_uid: { ...orangeMoneyUIDProperty, disabled: true },
});

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

export const recentPaymentsCollection = buildCollection<Partial<Recipient>>({
	name: 'Payment Confirmations',
	singularName: 'Recipient',
	path: RECIPIENT_FIRESTORE_PATH,
	alias: 'recentPayments',
	group: 'Recipients',
	icon: 'PriceCheck',
	description: 'Payment confirmations of last three month',
	textSearchEnabled: true,
	properties: basicRecipientProperties,
	subcollections: [paymentsCollection],
	exportable: false,
	Actions: CreateOrangeMoneyCSVAction,
	inlineEditing: true,
	additionalColumns: [CurrMonthCol, PrevMonthCol, PrevPrevMonthCol],
});
