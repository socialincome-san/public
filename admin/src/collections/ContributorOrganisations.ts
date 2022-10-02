import { buildCollection, buildProperties } from '@camberi/firecms';
import { ContributorOrganisation, CONTRIBUTOR_ORGANISATION_FIRESTORE_PATH } from '@socialincome/shared/types';

// this collection is publicly accessible. no personal data of user should be added here.
export const contributorOrganisationsCollection = buildCollection<ContributorOrganisation>({
	name: 'Contributor Organisations',
	group: 'Contributors',
	path: CONTRIBUTOR_ORGANISATION_FIRESTORE_PATH,
	textSearchEnabled: false,
	icon: 'CorporateFare',
	description: 'Lists all organisations who contribute or have employees who do.',
	permissions: ({ authController }) => ({
		edit: true,
		create: true,
		delete: true,
	}),
	properties: buildProperties<ContributorOrganisation>({
		org_name: {
			dataType: 'string',
			name: 'Org. Name',
		},
		org_name_en: {
			dataType: 'string',
			name: 'Org. Name EN',
		},
		org_name_de: {
			dataType: 'string',
			name: 'Org. Name DE',
		},
		org_name_fr: {
			dataType: 'string',
			name: 'Org. Name FR',
		},
		org_name_it: {
			dataType: 'string',
			name: 'Org. Name IT',
		},
		alt_search_terms: {
			name: 'Search Terms',
			dataType: 'array',
			of: {
				dataType: 'string',
				previewAsTag: true,
			},
			expanded: true,
		},
		country: {
			dataType: 'string',
			name: 'Country',
		},
		global: {
			dataType: 'boolean',
			name: 'Global Org.',
		},
		public_sector: {
			dataType: 'boolean',
			name: 'Public Sector',
		},
		workforce_number: {
			dataType: 'number',
			name: 'Workforce Number',
		},
		workforce_scale: {
			dataType: 'string',
			name: 'Workforce Scale',
			enumValues: {
				s1_5: '1-5',
				s6_25: '6-25',
				s26_100: '26-100',
				s101_250: '101-250',
				s251_1000: '251-1000',
				s1000plus: '1000+',
			},
		},
	}),
});
