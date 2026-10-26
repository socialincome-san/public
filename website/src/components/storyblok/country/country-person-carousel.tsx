import { CountryOfficeSection } from '@/components/storyblok/shared/country-office-section';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { CountryStory } from './country.types';
import { getCountryIsoCode, getCountryTitle } from './country.utils';

type Props = {
	country: CountryStory;
	lang: WebsiteLanguage;
};

export const CountryPersonCarousel = ({ country, lang }: Props) => (
	<CountryOfficeSection
		isoCode={getCountryIsoCode(country.content)}
		title={country.content.countryOfficeTitle}
		heading={getCountryTitle(country.content)}
		description={country.content.countryOfficeDescription}
		lang={lang}
	/>
);
