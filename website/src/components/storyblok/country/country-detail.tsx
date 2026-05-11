import { Button } from '@/components/button';
import { MakeDonationForm } from '@/components/make-donation-form';
import { LandingPageDetail } from '@/components/storyblok/shared/landing-page-detail';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import NextImage from 'next/image';
import NextLink from 'next/link';
import type { CountryStory } from './country.types';
import { getCountryDescription, getCountryIsoCode, getCountryTitle } from './country.utils';
import { PersonCard } from './person-card';

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
	const isoCodeLower = isoCode.toLowerCase();
	const countryTitle = getCountryTitle(country.content);
	const heroImageFilename = country.content.heroImage?.filename;
	const heroImageAlt = country.content.heroImage?.alt ?? countryTitle;
	const countryOfficePersonsResult = await services.storyblok.getPersonsByCountryOffice(lang, isoCode);
	const countryOfficePersons = countryOfficePersonsResult.success ? countryOfficePersonsResult.data : [];

	return (
		<div>
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
			{countryOfficePersons.length > 0 ? (
				<ul className="w-site-width max-w-content mx-auto grid grid-cols-1 gap-6 px-6 pb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{countryOfficePersons.map((person) => (
						<PersonCard key={person.uuid} person={person} />
					))}
				</ul>
			) : null}
		</div>
	);
};
