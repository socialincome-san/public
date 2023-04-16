import { Button } from '@mui/material';
import {
	Payment,
	PaymentStatus,
	Recipient,
	RecipientProgramStatus,
	RECIPIENT_FIRESTORE_PATH,
} from '@socialincome/shared/src/types';
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

function createMonthColumn(
	monthID: string,
	monthLabel: string,
	showButton: boolean
): AdditionalFieldDelegate<Partial<Recipient>> {
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
					.then((entity) => {
						const onConfirmation = (e: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>) => {
							if (entity?.values.status === PaymentStatus.Paid) {
								context.dataSource.saveEntity<Payment>({
									path: entity.path,
									entityId: entity.id,
									values: { ...entity.values, status: PaymentStatus.Confirmed },
									collection: paymentsCollection,
									status: 'existing',
								});
							}
						};
						return (
							<div>
								<StringPropertyPreview
									property={buildProperty({
										dataType: 'string',
										enumValues: paymentStatusEnumValues,
									})}
									value={entity?.values.status || ''}
									size="small"
								/>
								{showButton && entity?.values.status === PaymentStatus.Paid && (
									<Button onClick={onConfirmation}>Confirm</Button>
								)}
							</div>
						);
					})}
			/>
		),
	};
}

export const CurrMonthCol = (showButton: boolean) =>
	createMonthColumn(monthIDs[0], monthIDs[0] + ' (Current)', showButton);
export const PrevMonthCol = createMonthColumn(monthIDs[1], monthIDs[1], false);
export const PrevPrevMonthCol = createMonthColumn(monthIDs[2], monthIDs[2], false);

export const buildRecipientsPaymentsCollection = ({ isGlobalAdmin, organisations }: BuildCollectionProps) => {
	const defaultProps: EntityCollection<Partial<Recipient>> = {
		name: 'Payments',
		singularName: 'Recipient',
		path: RECIPIENT_FIRESTORE_PATH,
		alias: 'recent-payments',
		group: 'Recipients',
		icon: 'AttachMoneyTwoTone',
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
		additionalFields: [PaymentsLeft, CurrMonthCol(false), PrevMonthCol, PrevPrevMonthCol],
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

export const buildRecipientsPaymentsConfirmationCollection = () => {
	return buildAuditedCollection({
		name: 'Payments Confirmation',
		path: RECIPIENT_FIRESTORE_PATH,
		alias: 'payments-confirmation',
		group: 'Recipients',
		icon: 'PriceCheck',
		description: 'To confirm payments of the current month',
		textSearchEnabled: true,
		selectionEnabled: false,
		permissions: {
			read: false,
			create: false,
			edit: false,
			delete: false,
		},
		properties: buildProperties<Partial<Recipient>>({
			om_uid: orangeMoneyUIDProperty,
			first_name: firstNameProperty,
			last_name: lastNameProperty,
		}),
		defaultSize: 'xs',
		exportable: false,
		inlineEditing: false,
		additionalFields: [CurrMonthCol(true), PaymentsLeft],
		initialFilter: {
			progr_status: ['in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated]],
		},
	});
};
