import { buildProperties, EnumValues } from 'firecms';
import { Campaign, CAMPAIGN_FIRESTORE_PATH, CampaignStatus } from '../../../shared/src/types/campaign';
import { buildAuditedCollection } from './shared';

export const campaignStatusEnumValues: EnumValues = [
	{ id: CampaignStatus.Active, label: 'Active', color: 'greenDark' },
	{ id: CampaignStatus.Inactive, label: 'Inactive', color: 'grayDark' },
];

export const campaignsCollection = buildAuditedCollection<Campaign>({
	name: 'Campaigns',
	singularName: 'Campaign',
	icon: 'Campaign',
	group: 'Contributors',
	path: CAMPAIGN_FIRESTORE_PATH,
	textSearchEnabled: false,
	initialSort: ['start_date', 'asc'],
	permissions: {
		edit: true,
		create: true,
		delete: true,
	},
	properties: buildProperties<Campaign>({
		email: {
			dataType: 'string',
			name: 'Email',
			description: 'Email of the campaign creator.',
			validation: { required: true },
		},
		title: {
			dataType: 'string',
			name: 'Title',
			description: 'Visible in the fundraising page.',
			validation: { required: true },
		},
		description: {
			dataType: 'string',
			name: 'Description',
			description: 'Visible in the fundraising page.',
			multiline: true,
			validation: { required: true },
		},
		amount_collected_chf: {
			dataType: 'number',
			name: 'Collected amount in CHF',
			readOnly: true,
		},
		goal: {
			dataType: 'number',
			name: 'Optional Fundraising Goal',
		},
		goal_currency: {
			dataType: 'string',
			name: 'Goal Currency',
			enumValues: {
				CHF: 'CHF',
				USD: 'USD',
				EUR: 'EUR',
			},
		},
		start_date: {
			// @ts-ignore
			dataType: 'date',
			name: 'Start Date',
			mode: 'date',
			validation: { required: true },
		},
		end_date: {
			// @ts-ignore
			dataType: 'date',
			name: 'End Date',
			mode: 'date',
			validation: { required: true },
		},
		status: {
			dataType: 'string',
			name: 'Status',
			enumValues: campaignStatusEnumValues,
			validation: { required: true },
		},
	}),
});
