import { LandingPageCard } from '@/components/storyblok/shared/landing-page-card';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import NextImage from 'next/image';
import type { CountryStory } from './country.types';
import { getCountryIsoCode, getCountrySlug, getCountryTitle } from './country.utils';

type Props = {
	countries: CountryStory[];
	statsByIsoCode: Record<string, { programsCount: number; recipientsCount: number } | undefined>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	title?: string;
	text?: string;
};

export const CountriesOverview = async ({ countries, statsByIsoCode, lang, region, title, text }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const hasCmsHeader = Boolean(title?.trim()) || Boolean(text?.trim());

	return (
		<div className="flex w-full flex-col gap-8">
			{hasCmsHeader ? (
				<div className="flex flex-col gap-4">
					{title?.trim() ? <h1 className="font-sans text-5xl font-normal text-cyan-900">{title.trim()}</h1> : null}
					{text?.trim() ? <p className="text-foreground font-sans text-lg font-normal not-italic">{text.trim()}</p> : null}
				</div>
			) : null}
			{countries.length === 0 ? (
				<p className="text-muted-foreground">{translator.t('countries-page.empty')}</p>
			) : (
				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{countries.map((country) => {
						const countryIsoCode = getCountryIsoCode(country.content);
						const normalizedIsoCode = countryIsoCode.trim().toUpperCase();
						const countryIsoCodeLower = normalizedIsoCode.toLowerCase();
						const countryTitle = getCountryTitle(country.content);
						const countrySlug = getCountrySlug(country);
						const stats = statsByIsoCode[normalizedIsoCode] ?? { programsCount: 0, recipientsCount: 0 };
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
										alt={`${normalizedIsoCode} flag`}
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
