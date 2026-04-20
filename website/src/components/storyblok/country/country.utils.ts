import type { CountryStory } from '@/components/storyblok/country/country.types';
import type { Country } from '@/generated/storyblok/types/109655/storyblok-components';

export const getCountryIsoCode = (country: Country) => {
	return country.isoCode?.trim() ?? '-';
};

export const getCountryDescription = (country: Country) => {
	return country.description?.trim() ?? '';
};

export const getCountrySlug = (country: CountryStory) => {
	const fullSlugTail = country.full_slug?.split('/').at(-1);

	return fullSlugTail ?? country.slug;
};

export const getCountryTitle = (country: Country) => {
	return country.title?.trim() ?? getCountryIsoCode(country);
};
