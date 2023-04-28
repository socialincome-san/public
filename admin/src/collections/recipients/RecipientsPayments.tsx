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
	Entity,
	StringPropertyPreview,
	useDataSource,
} from 'firecms';
import { useState } from 'react';
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
	showButton: boolean;
	entity?: Entity<Payment>;
}

function CreateMonthColumn({ entity, showButton }: CreateMonthColumnProps) {
	const dataSource = useDataSource();
	const [entityState, setEntityState] = useState(entity);
	const onConfirmation = (event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		if (entityState?.values.status === PaymentStatus.Paid) {
			dataSource
				.saveEntity<Payment>({
					path: entityState.path,
					entityId: entityState.id,
					values: { status: PaymentStatus.Confirmed },
					previousValues: entityState.values,
					collection: paymentsCollection,
					status: 'existing',
				})
				.then((savedEntity) => {
					setEntityState(savedEntity);
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
				value={entityState?.values.status || ''}
				size="small"
			/>
			{showButton && entityState?.values.status === PaymentStatus.Paid && (
				<Button onClick={onConfirmation}>Confirm</Button>
			)}
		</div>
	);
}

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
					.then((entity) => (
						<CreateMonthColumn showButton={showButton} entity={entity} />
					))}
			/>
		),
	};
}

export const CurrMonthCol = (showButton: boolean) =>
	createMonthColumn(monthIDs[0], monthIDs[0] + ' (Current)', showButton);
export const PrevMonthCol = createMonthColumn(monthIDs[1], monthIDs[1], false);
export const PrevPrevMonthCol = createMonthColumn(monthIDs[2], monthIDs[2], false);

export const buildRecipientsPaymentsCollection = () => {
	return buildAuditedCollection<Partial<Recipient>>({
		name: 'Payments',
		singularName: 'Recipient',
		path: RECIPIENT_FIRESTORE_PATH,
		alias: 'recent-payments',
		group: 'Recipients',
		icon: 'AttachMoneyTwoTone',
		description: 'Payment overview over the last three months.',
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
		additionalFields: [PaymentsLeft, CurrMonthCol(false), PrevMonthCol, PrevPrevMonthCol],
		initialFilter: {
			progr_status: ['in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated]],
		},
	});
};
