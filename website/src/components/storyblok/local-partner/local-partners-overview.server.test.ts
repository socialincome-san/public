import type { LocalPartnerStory } from './local-partner.types';
import {
	getCountryFilterOptions,
	getCountryQuery,
	getSearchQuery,
	localPartnerMatchesCountryQuery,
	localPartnerMatchesSearchQuery,
} from './local-partners-overview.server';

type CreateLocalPartnerInput = {
	slug: string;
	title: string;
	description: string;
	countryIsoCode?: string;
};

const createLocalPartner = ({ slug, title, description, countryIsoCode }: CreateLocalPartnerInput) =>
	({
		uuid: slug,
		slug,
		full_slug: `pages/local-partners/${slug}`,
		content: {
			component: 'localPartner',
			_uid: slug,
			title,
			countryIsoCode,
			description: {
				type: 'doc',
				content: [{ type: 'text', text: description }],
			},
		},
	}) as unknown as LocalPartnerStory;

const localPartners = [
	createLocalPartner({
		slug: 'the-ark-foundation',
		title: 'The Ark Foundation',
		description: 'Community support in Freetown',
		countryIsoCode: 'SL',
	}),
	createLocalPartner({
		slug: 'aurora-foundation',
		title: 'Aurora Foundation',
		description: 'Livelihood programs',
		countryIsoCode: 'GH',
	}),
];

describe('local partners overview server helpers', () => {
	it('reads search and country query params', () => {
		expect(getSearchQuery({ search: ' ark ' })).toBe('ark');
		expect(getCountryQuery({ country: ['sl', 'GH'] })).toBe('SL');
	});

	it('derives country options from partner stories', () => {
		expect(getCountryFilterOptions(localPartners).map((option) => option.value)).toEqual(['GH', 'SL']);
	});

	it('filters partners by country', () => {
		const sierraLeonePartners = localPartners.filter((localPartner) => localPartnerMatchesCountryQuery(localPartner, 'SL'));

		expect(sierraLeonePartners.map((localPartner) => localPartner.slug)).toEqual(['the-ark-foundation']);
	});

	it('searches partner title, slug, description, country name, and ISO code', () => {
		expect(
			localPartners
				.filter((localPartner) => localPartnerMatchesSearchQuery(localPartner, 'sierra leone'))
				.map((localPartner) => localPartner.slug),
		).toEqual(['the-ark-foundation']);
		expect(
			localPartners
				.filter((localPartner) => localPartnerMatchesSearchQuery(localPartner, 'GH'))
				.map((localPartner) => localPartner.slug),
		).toEqual(['aurora-foundation']);
		expect(
			localPartners
				.filter((localPartner) => localPartnerMatchesSearchQuery(localPartner, 'ark freetown'))
				.map((localPartner) => localPartner.slug),
		).toEqual(['the-ark-foundation']);
	});
});
