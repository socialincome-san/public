import { Recipient, RecipientProgramStatus, RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import { getMonthIDs } from '@socialincome/shared/src/utils/date';
import {
	AdditionalFieldDelegate,
	AsyncPreviewComponent,
	buildProperties,
	buildProperty,
	StringPropertyPreview,
} from 'firecms';
import { EntityCollection } from 'firecms/dist/types';
import { BuildCollectionProps } from '../index';
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
								enumValues: paymentStatusEnumValues,
							})}
							value={entity?.values.status || ''}
							size="small"
						/>
					))}
			/>
		),
	};
}

export const CurrMonthCol = createMonthColumn(monthIDs[0], monthIDs[0] + ' (Current)');
export const PrevMonthCol = createMonthColumn(monthIDs[1], monthIDs[1]);
export const PrevPrevMonthCol = createMonthColumn(monthIDs[2], monthIDs[2]);

export const buildRecipientsPaymentsCollection = ({ isGlobalAdmin, organisations }: BuildCollectionProps) => {
	const defaultProps: EntityCollection<Partial<Recipient>> = {
		name: 'Payments',
		singularName: 'Recipient',
		path: RECIPIENT_FIRESTORE_PATH,
		alias: 'recentPayments',
		group: 'Recipients',
		icon: 'PriceCheck',
		description: 'Payment confirmations of last three month',
		textSearchEnabled: true,
		permissions: {
			create: isGlobalAdmin,
			edit: isGlobalAdmin,
			delete: isGlobalAdmin,
		},
		properties: buildProperties<Partial<Recipient>>({
			om_uid: orangeMoneyUIDProperty,
			progr_status: programStatusProperty,
			first_name: firstNameProperty,
			last_name: lastNameProperty,
		}),
		defaultSize: 'xs',
		subcollections: isGlobalAdmin ? [paymentsCollection] : [],
		exportable: false,
		inlineEditing: false,
		additionalFields: [PaymentsLeft, CurrMonthCol, PrevMonthCol, PrevPrevMonthCol],
	};
	if (isGlobalAdmin) {
		return buildAuditedCollection<Partial<Recipient>>({
			...defaultProps,
			initialFilter: {
				progr_status: ['in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated]],
			},
		});
	} else {
		return buildAuditedCollection<Partial<Recipient>>({
			...defaultProps,
			forceFilter: {
				organisation: ['in', organisations],
				progr_status: ['in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated]],
			},
		});
	}
};
