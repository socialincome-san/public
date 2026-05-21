import { Button } from '@/components/button';
import { LocalPartnersTeaserRowContent } from '@/components/content-blocks/local-partners-teaser-row';
import { MakeDonationForm } from '@/components/make-donation-form';
import { LandingPageDetail } from '@/components/storyblok/shared/landing-page-detail';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { CountryDonationsTotal } from './country-donations-total';
import { CountryPersonCarousel } from './country-person-carousel';
import { CountryPrograms } from './country-programs';
import type { CountryStory } from './country.types';
import { getCountryDescription, getCountryIsoCode, getCountryLocalPartners, getCountryTitle } from './country.utils';
import { MapBubble } from './map-bubble';

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
	const donationsBlock = country.content.donations?.[0] ?? null;
	const programsBlock = country.content.programs?.[0] ?? null;
	const localPartners = getCountryLocalPartners(country.content);

	return (
		<>
			<LandingPageDetail
				title={countryTitle}
				description={countryDescription}
				heroImageFilename={heroImageFilename}
				heroImageAlt={heroImageAlt}
				titleVisual={
					<NextImage
						src={`/assets/flags/${isoCodeLower}.svg`}
						alt={`${isoCode} flag`}
						width={44}
						height={32}
						className="h-8 w-auto rounded-sm"
					/>
				}
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
				actions={
					<Button variant="outline" size="lg" asChild>
						<NextLink href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/donate`}>
							{translator.t('countries-page.donate-now')}
						</NextLink>
					</Button>
				}
				sideContent={<MakeDonationForm lang={lang} />}
				mobileContent={<MakeDonationForm lang={lang} />}
				descriptionHeading={`${translator.t('countries-page.about')} ${countryTitle}`}
			/>
			{hasIsoCode ? (
				<section className="w-site-width max-w-content mx-auto px-6 py-8 lg:py-12">
					<div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
						<div className="flex justify-center lg:justify-start">
							<MapBubble isoCode={isoCode} countryName={countryTitle} />
						</div>
						<div className="flex flex-col gap-4">
							<h2 className="text-2xl font-semibold md:text-3xl">{`${translator.t('countries-page.about')} ${countryTitle}`}</h2>
							<p className="text-base">{countryDescription || '-'}</p>
						</div>
					</div>
				</section>
			) : null}
			{countryOfficePersons.length > 0 ? (
				<div className="max-w-content 2xl:w-site-width ml-[2vw] py-8 pl-6 2xl:mx-auto">
					<CountryPersonCarousel
						persons={countryOfficePersons}
						countryName={countryTitle}
						countryOfficeTitle={country.content.countryOfficeTitle?.trim()}
						countryOfficeDescription={country.content.countryOfficeDescription?.trim()}
					/>
				</div>
			) : null}

			{donationsBlock ? <CountryDonationsTotal blok={donationsBlock} isoCode={isoCode} lang={lang} region={region} /> : null}
			{programsBlock ? <CountryPrograms blok={programsBlock} isoCode={isoCode} lang={lang} region={region} /> : null}
			{localPartners.length > 0 ? (
				<div className="max-w-content 2xl:w-site-width ml-[2vw] py-8 pl-6 2xl:mx-auto">
					<LocalPartnersTeaserRowContent localPartners={localPartners} lang={lang} region={region} />
				</div>
			) : null}
		</>
	);
};
