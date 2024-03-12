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
	initialSort: ['end_date', 'asc'],
	permissions: {
		edit: true,
		create: true,
		delete: true,
	},
	properties: buildProperties<Campaign>({
		creator_name: {
			dataType: 'string',
			name: 'Creator Name',
			description: 'Visible in the fundraising page.',
			validation: { required: true },
		},
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
		second_description_title: {
			dataType: 'string',
			name: 'Second Description Title',
			description: 'Visible in the fundraising page.',
		},
		second_description: {
			dataType: 'string',
			name: 'Second Description',
			description: 'Visible in the fundraising page.',
			multiline: true,
		},
		third_description_title: {
			dataType: 'string',
			name: 'Thrird Description Title',
			description: 'Visible in the fundraising page.',
		},
		third_description: {
			dataType: 'string',
			name: 'Third Description',
			description: 'Visible in the fundraising page.',
			multiline: true,
		},
		amount_collected_chf: {
			dataType: 'number',
			name: 'Collected amount in CHF',
			readOnly: true,
		},
		contributions: {
			dataType: 'number',
			name: 'Contributions',
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
		metadata_description: {
			dataType: 'string',
			name: 'Metadata Description',
		},
		metadata_ogImage: {
			dataType: 'string',
			name: 'Metadata Open Graph Image Path',
		},
		metadata_twitterImage: {
			dataType: 'string',
			name: 'Metadata Twitter Image Path',
		},
	}),
});
