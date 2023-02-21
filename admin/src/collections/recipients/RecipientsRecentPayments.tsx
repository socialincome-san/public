import {
	AdditionalFieldDelegate,
	AsyncPreviewComponent,
	buildProperties,
	buildProperty,
	StringPropertyPreview,
} from '@camberi/firecms';
import { Recipient, RecipientProgramStatus, RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import { getMonthIDs } from '@socialincome/shared/src/utils/date';
import { CreateOrangeMoneyCSVAction } from '../../actions/CreateOrangeMoneyCSVAction';
import { BuildCollectionProps } from '../index';
import { paymentsCollection, paymentStatusMap } from '../Payments';
import { buildAuditedCollection } from '../shared';
import {
	firstNameProperty,
	lastNameProperty,
	orangeMoneyUIDProperty,
	programStatusProperty,
} from './RecipientsProperties';

const currentDate = new Date();
const monthIDs = getMonthIDs(currentDate, 3);

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
					.then((entity) => (
						<StringPropertyPreview
							property={buildProperty({
								dataType: 'string',
								enumValues: paymentStatusMap,
							})}
							value={entity?.values.status || ''}
							size={'regular'}
						/>
					))}
			/>
		),
	};
}

const CurrMonthCol = createMonthColumn(monthIDs[0], monthIDs[0] + ' (Current)');
const PrevMonthCol = createMonthColumn(monthIDs[1], monthIDs[1]);
const PrevPrevMonthCol = createMonthColumn(monthIDs[2], monthIDs[2]);

export const buildRecipientsRecentPaymentsCollection = ({ isGlobalAdmin, organisations }: BuildCollectionProps) => {
	const defaultProps = {
		name: 'Recent Payments',
		singularName: 'Recipient',
		path: RECIPIENT_FIRESTORE_PATH,
		alias: 'recentPayments',
		group: 'Recipients',
		icon: 'PriceCheck',
		description: 'Payment confirmations of last three month',
		textSearchEnabled: true,
		properties: buildProperties<Partial<Recipient>>({
			om_uid: orangeMoneyUIDProperty,
			progr_status: programStatusProperty,
			first_name: firstNameProperty,
			last_name: lastNameProperty,
		}),
		subcollections: [paymentsCollection],
		exportable: false,
		inlineEditing: false,
		additionalFields: [CurrMonthCol, PrevMonthCol, PrevPrevMonthCol],
	};
	if (isGlobalAdmin) {
		return buildAuditedCollection<Partial<Recipient>>({
			...defaultProps,
			initialFilter: {
				progr_status: ['==', RecipientProgramStatus.Active],
			},
			Actions: [CreateOrangeMoneyCSVAction],
		});
	} else {
		return buildAuditedCollection<Partial<Recipient>>({
			...defaultProps,
			forceFilter: {
				organisation: ['in', organisations || []],
			},
		});
	}
};
