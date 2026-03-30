import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { LandingPageCard } from '@/components/storyblok/shared/landing-page-card';
import NextImage from 'next/image';
import type { CountryStory } from './country.types';
import { getCountryIsoCode, getCountrySlug, getCountryTitle } from './country.utils';

type Props = {
	countries: CountryStory[];
	statsByIsoCode: Record<string, { programsCount: number; recipientsCount: number } | undefined>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const CountriesOverview = async ({ countries, statsByIsoCode, lang, region }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<div className="w-site-width max-w-content mx-auto flex w-full flex-col gap-6 px-6 py-8">
			<h1 className="text-3xl font-semibold">{translator.t('countries-page.title')}</h1>
			{countries.length === 0 ? (
				<p className="text-muted-foreground">{translator.t('countries-page.empty')}</p>
			) : (
				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{countries.map((country) => {
						const countryIsoCode = getCountryIsoCode(country.content);
						const countryIsoCodeLower = countryIsoCode.toLowerCase();
						const countryTitle = getCountryTitle(country.content);
						const countrySlug = getCountrySlug(country);
						const stats = statsByIsoCode[countryIsoCode] ?? { programsCount: 0, recipientsCount: 0 };
						const heroImageFilename = country.content.heroImage?.filename;
						const heroImageAlt = country.content.heroImage?.alt ?? countryTitle;

						return (
							<LandingPageCard
								key={country.uuid}
								href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/countries/${countrySlug}`}
								title={countryTitle}
								heroImageFilename={heroImageFilename}
								heroImageAlt={heroImageAlt}
								titleVisual={
									<NextImage
										src={`/assets/flags/${countryIsoCodeLower}.svg`}
										alt={`${countryIsoCode} flag`}
										width={36}
										height={26}
										className="h-6 w-auto rounded-sm"
									/>
								}
								stats={[
									{
										value: stats.programsCount,
										label:
											stats.programsCount === 1
												? translator.t('countries-page.program-singular')
												: translator.t('countries-page.program-plural'),
									},
									{
										value: stats.recipientsCount,
										label:
											stats.recipientsCount === 1
												? translator.t('countries-page.recipient-singular')
												: translator.t('countries-page.recipient-plural'),
									},
								]}
							/>
						);
					})}
				</ul>
			)}
		</div>
	);
};
