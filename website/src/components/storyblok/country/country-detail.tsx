import { LocalPartnersTeaserRowContent } from '@/components/content-blocks/local-partners-teaser-row';
import { HeroDonationsHeader } from '@/components/storyblok/shared/hero-donations-header';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { CountryPersonCarousel } from './country-person-carousel';
import type { CountryStory } from './country.types';
import { getCountryDescription, getCountryIsoCode, getCountryLocalPartners, getCountryTitle } from './country.utils';
import { MapBubble } from './map-bubble';
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
	const countryDescription = getCountryDescription(country.content);
	const isoCode = getCountryIsoCode(country.content);
	const hasIsoCode = isoCode !== '-';
	const isoCodeLower = isoCode.toLowerCase();
	const countryTitle = getCountryTitle(country.content);
	const heroImageFilename = country.content.heroImage?.filename;
	const heroImageAlt = country.content.heroImage?.alt ?? countryTitle;
	const countryOfficePersonsResult = await services.storyblok.getPersonsByCountryOffice(lang, isoCode);
	const countryOfficePersons = countryOfficePersonsResult.success ? countryOfficePersonsResult.data : [];
	const localPartners = getCountryLocalPartners(country.content);
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: country.full_slug,
		lang,
		region,
	});

	return (
		<>
			<HeroDonationsHeader
				lang={lang}
				title={countryTitle}
				description={countryDescription}
				heroImageFilename={heroImageFilename}
				heroImageAlt={heroImageAlt}
				titleIcon={`/assets/flags/${isoCodeLower}.svg`}
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
				{hasIsoCode ? (
					<section className="py-8 lg:py-12">
						<div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
							<div className="flex justify-center lg:justify-start">
								<MapBubble isoCode={isoCode} countryName={countryTitle} />
							</div>
							<div className="flex flex-col gap-4">
								<h2 className="text-4xl font-semibold md:text-3xl">{`${translator.t('countries-page.about')} ${countryTitle}`}</h2>
								<p className="text-base">{countryDescription || '-'}</p>
							</div>
						</div>
					</section>
				) : null}
				{countryOfficePersons.length > 0 ? (
					<section className="py-8">
						<CountryPersonCarousel
							persons={countryOfficePersons}
							countryName={countryTitle}
							countryOfficeTitle={country.content.countryOfficeTitle?.trim()}
							countryOfficeDescription={country.content.countryOfficeDescription?.trim()}
						/>
					</section>
				) : null}
				{localPartners.length > 0 ? (
					<section className="py-8">
						<LocalPartnersTeaserRowContent localPartners={localPartners} lang={lang} region={region} />
					</section>
				) : null}
			</div>
		</>
	);
};
