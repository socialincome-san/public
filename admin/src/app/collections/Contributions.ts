import { buildCollection, buildProperties } from '@camberi/firecms';
import { Contribution } from '@socialincome/shared/types';

export const contributionsCollection = buildCollection<Contribution>({
	name: 'Contributions',
	group: 'Finances',
	path: 'contributions',
	textSearchEnabled: false,
	permissions: ({ authController }) => ({
		edit: true,
		create: true,
		delete: true,
	}),
	properties: buildProperties<Contribution>({
		source: {
			dataType: 'string',
			name: 'Source',
			enumValues: {
				benevity: 'Benevity',
				cash: 'Cash',
				stripe: 'Stripe',
				twint: 'Twint',
				'wire-transfer': 'Wire Transfer',
			},
			validation: { required: true },
		},
		created: {
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
		amount_net_chf: {
			dataType: 'number',
			name: 'Amount Net Chf',
		},
		reference_id: {
			dataType: 'string',
			name: 'External Reference',
		},
	}),
});
