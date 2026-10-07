import { LandingPageCard } from '@/components/storyblok/shared/landing-page-card';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { CardGrid } from '@socialincome/design-system/layout/card-grid/card-grid';
import { PageIntro } from '@socialincome/design-system/layout/page-intro/page-intro';
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

	return (
		<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
			<div className="flex w-full flex-col gap-8">
				<PageIntro title={title} description={text} />
				<CardGrid emptyMessage={translator.t('countries-page.empty')}>
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
								href={`/${lang}/${region}/countries/${countrySlug}`}
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
				</CardGrid>
			</div>
		</BlockWrapper>
	);
};
