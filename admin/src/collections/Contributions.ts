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
		initialSort: ['created', 'desc'],
		properties: buildProperties<Contribution>({
			source: {
				dataType: 'string',
				name: 'Source',
				enumValues: [
					{ id: ContributionSourceKey.BENEVITY, label: 'Benevity' },
					{ id: ContributionSourceKey.CASH, label: 'Cash' },
					{ id: ContributionSourceKey.STRIPE, label: 'Stripe' },
					{ id: ContributionSourceKey.TWINT, label: 'Twint' },
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
					chf: 'CHF',
					usd: 'USD',
					eur: 'EUR',
				},
				validation: { required: true },
			},
			amount_chf: {
				dataType: 'number',
				name: 'Amount Chf (without fees applied)',
			},
			fees_chf: {
				dataType: 'number',
				name: 'Fees Chf',
			},
			reference_id: {
				dataType: 'string',
				name: 'External Reference',
			},
			monthly_interval: {
				dataType: 'number',
				name: 'Monthly recurrence interval',
			},
			status: {
				dataType: 'string',
				name: 'Status',
				enumValues: [
					{ id: StatusKey.SUCCEEDED, label: 'Succeeded' },
					{ id: StatusKey.PENDING, label: 'Pending' },
					{ id: StatusKey.FAILED, label: 'Failed' },
					{ id: StatusKey.UNKNOWN, label: 'Unknown' },
				],
				defaultValue: StatusKey.SUCCEEDED,
			},
		}),
		...collectionProps,
	});
}
