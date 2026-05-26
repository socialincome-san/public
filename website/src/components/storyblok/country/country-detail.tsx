import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { LocalPartnersTeaserRowContent } from '@/components/content-blocks/local-partners-teaser-row';
import { HeroDonationsHeader } from '@/components/storyblok/shared/hero-donations-header';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { Suspense } from 'react';
import { CountryPayoutsTotal } from './country-payouts-total';
import { CountryMap } from './country-map';
import { CountryPersonCarousel } from './country-person-carousel';
import { CountryPrograms } from './country-programs';
import { CountryStatistics } from './country-statistics';
import { CountryStatisticsSkeleton } from './country-statistics-skeleton';
import type { CountryStory } from './country.types';
import { getCountryIsoCode, getCountryLocalPartners, getCountryTitle } from './country.utils';

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
				titleIcon={isoCode === '-' ? undefined : `/assets/flags/${isoCode.toLowerCase()}.svg`}
				titleIconAlt={isoCode === '-' ? undefined : `${isoCode} flag`}
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
			<div className="max-w-content 2xl:w-site-width ml-[2vw] pl-8 2xl:mx-auto">
				<Breadcrumb links={breadcrumbLinks} />
				<CountryMap country={country} lang={lang} />
				<CountryPersonCarousel country={country} lang={lang} />
				<CountryPayoutsTotal country={country} lang={lang} region={region} />
				{isoCode !== '-' && (
					<Suspense fallback={<CountryStatisticsSkeleton lang={lang} />}>
						<CountryStatistics countryIsoCode={isoCode} countryName={countryTitle} lang={lang} />
					</Suspense>
				)}
				<CountryPrograms country={country} lang={lang} region={region} />
				{localPartners.length > 0 && (
					<LocalPartnersTeaserRowContent localPartners={localPartners} lang={lang} region={region} />
				)}
			</div>
		</>
	);
};
