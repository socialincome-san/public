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
		link_website: {
			title: 'Website Link',
			dataType: 'string',
			validation: { required: false },
			description: 'The link to the website (optional)',
		},
		link_instagram: {
			title: 'Instagram Link',
			dataType: 'string',
			validation: { required: false },
			description: 'The link to the Instagram profile (optional)',
		},
		link_tiktok: {
			title: 'TikTok Link',
			dataType: 'string',
			validation: { required: false },
			description: 'The link to the TikTok profile (optional)',
		},
		link_facebook: {
			title: 'Facebook Link',
			dataType: 'string',
			validation: { required: false },
			description: 'The link to the Facebook profile (optional)',
		},
		link_x: {
			title: 'X (formerly Twitter) Link',
			dataType: 'string',
			validation: { required: false },
			description: 'The link to the X profile (optional)',
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
		public: {
			dataType: 'boolean',
			name: 'Public',
			description: 'Listed on campaign overview',
			defaultValue: false,
		},
		featured: {
			dataType: 'boolean',
			name: 'Featured',
			description: 'Featured on campaign overview',
			defaultValue: false,
		},
		slug: {
			dataType: 'string',
			name: 'Url Slug',
			validation: {
				required: true,
				matches: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
				matchMessage: 'Slug must contain only lowercase letters, numbers, and hyphens',
			},
			description:
				'URL-friendly version of the title. Must be unique and contain only lowercase letters, numbers, and hyphens.',
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
