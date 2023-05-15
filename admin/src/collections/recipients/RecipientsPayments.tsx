import { Payment, Recipient, RecipientProgramStatus, RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import { getMonthIDs } from '@socialincome/shared/src/utils/date';
import {
	AdditionalFieldDelegate,
	AsyncPreviewComponent,
	buildProperties,
	Entity,
	StringPropertyPreview,
} from 'firecms';
import { PaymentProcessAction } from '../../actions/PaymentProcessAction';
import { paymentsCollection, paymentStatusEnumValues } from '../Payments';
import { buildAuditedCollection } from '../shared';
import { PaymentsLeft } from './Recipients';
import {
	firstNameProperty,
	lastNameProperty,
	orangeMoneyUIDProperty,
	programStatusProperty,
} from './RecipientsProperties';

const currentDate = new Date();
const monthIDs = getMonthIDs(currentDate, 3);

interface CreateMonthColumnProps {
	entity: Entity<Payment>;
}

function CreateMonthColumn({ entity }: CreateMonthColumnProps) {
	return (
		<StringPropertyPreview
			property={{ dataType: 'string', enumValues: paymentStatusEnumValues }}
			value={entity.values.status || ''}
			size="small"
		/>
	);
}

function createMonthColumn(monthID: string, monthLabel: string): AdditionalFieldDelegate<Partial<Recipient>> {
	return {
		id: monthID,
		name: monthLabel,
		Builder: ({ entity, context }) => (
			<AsyncPreviewComponent
				builder={context.dataSource
					.fetchEntity({
						path: entity.path + '/' + entity.id + '/payments',
						entityId: monthID,
						collection: paymentsCollection,
					})
					.then((entity) => (entity ? <CreateMonthColumn entity={entity} /> : null))}
			/>
		),
	};
}

export const CurrMonthCol = createMonthColumn(monthIDs[0], monthIDs[0] + ' (Current)');
export const PrevMonthCol = createMonthColumn(monthIDs[1], monthIDs[1]);
export const PrevPrevMonthCol = createMonthColumn(monthIDs[2], monthIDs[2]);

export const buildRecipientsPaymentsCollection = () => {
	return buildAuditedCollection<Partial<Recipient>>({
		name: 'Payments',
		singularName: 'Recipient',
		path: RECIPIENT_FIRESTORE_PATH,
		alias: 'recent-payments',
		group: 'Recipients',
		icon: 'AttachMoneyTwoTone',
		description: 'Payment overview over the last three months',
		defaultSize: 'xs',
		textSearchEnabled: true,
		Actions: PaymentProcessAction,
		properties: buildProperties<Partial<Recipient>>({
			om_uid: orangeMoneyUIDProperty,
			progr_status: programStatusProperty,
			first_name: firstNameProperty,
			last_name: lastNameProperty,
		}),
		subcollections: [paymentsCollection],
		exportable: false,
		inlineEditing: false,
		additionalFields: [PaymentsLeft, CurrMonthCol, PrevMonthCol, PrevPrevMonthCol],
		initialFilter: {
			progr_status: ['in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated]],
		},
	});
};
