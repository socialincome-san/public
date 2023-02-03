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
import { BuildCollectionProps } from './index';
import { paymentsCollection, paymentStatusMap } from './Payments';
import { firstNameProperty, lastNameProperty, orangeMoneyUIDProperty, programStatusProperty } from './Recipients';

let currentDate = new Date();
let monthIDs = getMonthIDs(currentDate, 3);

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
		name: 'Payment Confirmations',
		singularName: 'Recipient',
		path: RECIPIENT_FIRESTORE_PATH,
		alias: 'recentPayments',
		group: 'Recipients',
		icon: 'PriceCheck',
		description: 'Payment confirmations of last three month',
		textSearchEnabled: true,
		properties: buildProperties<Partial<Recipient>>({
			progr_status: programStatusProperty,
			first_name: firstNameProperty,
			last_name: lastNameProperty,
			om_uid: { ...orangeMoneyUIDProperty, disabled: true },
		}),
		subcollections: [paymentsCollection],
		exportable: false,
		inlineEditing: false,
		additionalColumns: [CurrMonthCol, PrevMonthCol, PrevPrevMonthCol],
	};
	if (isGlobalAdmin) {
		return buildCollection<Partial<Recipient>>({
			...defaultProps,
			Actions: [CreateOrangeMoneyCSVAction],
		});
	} else {
		return buildCollection<Partial<Recipient>>({
			...defaultProps,
			forceFilter: {
				organisation: ['in', organisations || []],
			},
		});
	}
};
