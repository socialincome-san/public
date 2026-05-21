import { LocalPartnersTeaserRowContent } from '@/components/content-blocks/local-partners-teaser-row';
import { HeroDonationsHeader } from '@/components/storyblok/shared/hero-donations-header';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { CountryDonationsTotal } from './country-donations-total';
import { CountryMap } from './country-map';
import { CountryPersonCarousel } from './country-person-carousel';
import { CountryPrograms } from './country-programs';
import type { CountryStory } from './country.types';
import { getCountryIsoCode, getCountryLocalPartners, getCountryTitle } from './country.utils';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';

type Props = {
	country: CountryStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	activeProgramsCount: number;
	recipientsCount: number;
};

export const CountryDetail = async ({ country, lang, region, activeProgramsCount, recipientsCount }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const isoCode = getCountryIsoCode(country.content);
	const countryTitle = getCountryTitle(country.content);
	const localPartners = getCountryLocalPartners(country.content);
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: country.full_slug,
		currentLabel: countryTitle,
		lang,
		region,
	});

	return (
		<>
			<HeroDonationsHeader
				lang={lang}
				title={countryTitle}
				heroImageFilename={country.content.heroImage?.filename}
				heroImageAlt={country.content.heroImage?.alt ?? countryTitle}
				titleIcon={`/assets/flags/${isoCode.toLowerCase()}.svg`}
				titleIconAlt={`${isoCode} flag`}
				stats={[
					{
						value: activeProgramsCount,
						label:
							activeProgramsCount === 1
								? translator.t('countries-page.active-program-singular')
								: translator.t('countries-page.active-program-plural'),
					},
					{
						value: recipientsCount,
						label:
							recipientsCount === 1
								? translator.t('countries-page.recipient-singular')
								: translator.t('countries-page.recipient-plural'),
					},
				]}
			/>
			<div className="max-w-content 2xl:w-site-width ml-[2vw] 2xl:mx-auto pl-8">
				<Breadcrumb links={breadcrumbLinks} />
				<CountryMap country={country} lang={lang} region={region} />
				<CountryPersonCarousel country={country} />
				<CountryDonationsTotal country={country} lang={lang} region={region} />
				<CountryPrograms country={country} lang={lang} region={region} />
				{localPartners.length > 0 ? (
					<LocalPartnersTeaserRowContent localPartners={localPartners} lang={lang} region={region} />
				) : null}
			</div>
		</>
	);
};
