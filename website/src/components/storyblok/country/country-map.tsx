import { EntityAboutSection } from '@/components/storyblok/shared/entity-about-section';
import { Translator } from '@/lib/i18n/translator';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import type { CountryStory } from './country.types';
import { getCountryDescription, getCountryIsoCode, getCountryTitle } from './country.utils';

type Props = {
	country: CountryStory;
};

export const CountryMap = async ({ country }: Props) => {
	const { lang } = await getWebsiteRootParams();
	const isoCode = getCountryIsoCode(country.content);
	if (isoCode === '-') {
		return null;
	}

	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const countryTitle = getCountryTitle(country.content);

	return (
		<EntityAboutSection
			isoCode={isoCode}
			mapLabel={countryTitle}
			aboutHeading={`${translator.t('countries-page.about')} ${countryTitle}`}
			description={getCountryDescription(country.content)}
		/>
	);
};
