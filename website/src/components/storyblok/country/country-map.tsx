import { EntityAboutSection } from '@/components/storyblok/shared/entity-about-section';
import { getTranslations } from 'next-intl/server';
import type { CountryStory } from './country.types';
import { getCountryDescription, getCountryIsoCode, getCountryTitle } from './country.utils';

type Props = {
	country: CountryStory;
};

export const CountryMap = async ({ country }: Props) => {
	const isoCode = getCountryIsoCode(country.content);
	if (isoCode === '-') {
		return null;
	}

	const t = await getTranslations('website-common');
	const countryTitle = getCountryTitle(country.content);

	return (
		<EntityAboutSection
			isoCode={isoCode}
			mapLabel={countryTitle}
			aboutHeading={`${t('countries-page.about')} ${countryTitle}`}
			description={getCountryDescription(country.content)}
		/>
	);
};
