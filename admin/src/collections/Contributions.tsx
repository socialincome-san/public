import { CAMPAIGN_FIRESTORE_PATH } from '@socialincome/shared/src/types/campaign';
import {
	CONTRIBUTION_FIRESTORE_PATH,
	Contribution,
	ContributionSourceKey,
	StatusKey,
} from '@socialincome/shared/src/types/contribution';
import { buildProperties } from 'firecms';
import { EntityCollection } from 'firecms/dist/types/collections';
import { buildAuditedCollection } from './shared';

export function buildContributionsCollection(
	collectionProps?: Partial<EntityCollection<Contribution>>,
): EntityCollection<Contribution> {
	return buildAuditedCollection<Contribution>({
		name: 'Contributions',
		group: 'Contributors',
		icon: 'Paid',
		path: CONTRIBUTION_FIRESTORE_PATH,
		textSearchEnabled: false,
		inlineEditing: false,
		initialSort: ['created', 'desc'],
		properties: buildProperties<Contribution>({
			source: {
				dataType: 'string',
				name: 'Source',
				enumValues: [
					{ id: ContributionSourceKey.BENEVITY, label: 'Benevity' },
					{ id: ContributionSourceKey.CASH, label: 'Cash' },
					{ id: ContributionSourceKey.STRIPE, label: 'Stripe' },
					{ id: ContributionSourceKey.RAISENOW, label: 'RaiseNow' },
					{ id: ContributionSourceKey.WIRE_TRANSFER, label: 'Wire Transfer' },
				],
				validation: { required: true },
			},
			created: {
				// @ts-ignore
				dataType: 'date',
				name: 'Created',
				mode: 'date',
				validation: { required: true },
			},
			amount: {
				dataType: 'number',
				name: 'Amount',
				validation: { required: true },
			},
			currency: {
				dataType: 'string',
				name: 'Currency',
				enumValues: {
					CHF: 'CHF',
					USD: 'USD',
					EUR: 'EUR',
				},
				validation: { required: true },
			},
			status: {
				dataType: 'string',
				name: 'Status',
				validation: { required: true },
				enumValues: [
					{ id: StatusKey.SUCCEEDED, label: 'Succeeded' },
					{ id: StatusKey.PENDING, label: 'Pending' },
					{ id: StatusKey.FAILED, label: 'Failed' },
					{ id: StatusKey.UNKNOWN, label: 'Unknown' },
				],
				defaultValue: StatusKey.SUCCEEDED,
			},
			amount_chf: {
				dataType: 'number',
				name: 'Amount CHF (same as amount if currency is CHF)',
				validation: { required: true },
			},
			fees_chf: {
				dataType: 'number',
				name: 'Fees Chf',
				validation: { required: true },
			},
			reference_id: {
				dataType: 'string',
				name: 'External Reference',
				Preview: (property) => {
					return (
						<>
							{property.entity?.values.source === ContributionSourceKey.STRIPE ? (
								<a
									target="_blank"
									rel="noopener noreferrer"
									href={`https://dashboard.stripe.com/payments/${property.value}`}
								>
									{property.value}
								</a>
							) : (
								property.value
							)}
						</>
					);
				},
			},
			monthly_interval: {
				dataType: 'number',
				name: 'Monthly recurrence interval',
				validation: { required: true },
				enumValues: { 0: 'One time', 1: 'Monthly', 3: 'Quarterly', 12: 'Annually' },
			},
			campaign_path: {
				dataType: 'reference',
				name: 'Campaign',
				path: CAMPAIGN_FIRESTORE_PATH,
			},
		}),
		...collectionProps,
	});
}
