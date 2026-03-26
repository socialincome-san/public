import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import NextImage from 'next/image';
import NextLink from 'next/link';
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
							<li key={country.uuid} className="overflow-hidden rounded-3xl border bg-black">
								<NextLink href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/countries/${countrySlug}`} className="group block">
									<div className="relative aspect-[16/10] bg-black">
										{heroImageFilename && (
											<NextImage
												src={heroImageFilename}
												alt={heroImageAlt}
												fill
												className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
											/>
										)}
										<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 transition-opacity duration-300 group-hover:opacity-90" />

										<div className="absolute inset-x-5 bottom-5 flex flex-col gap-3 text-white">
											<div className="flex items-center gap-3">
												<NextImage
													src={`/assets/flags/${countryIsoCodeLower}.svg`}
													alt={`${countryIsoCode} flag`}
													width={36}
													height={26}
													className="h-6 w-auto rounded-sm"
												/>
												<p className="text-lg font-semibold">{countryTitle}</p>
											</div>
											<div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/90">
												<p className="font-medium">
													{stats.programsCount}{' '}
													{stats.programsCount === 1
														? translator.t('countries-page.program-singular')
														: translator.t('countries-page.program-plural')}
												</p>
												<p className="font-medium">
													{stats.recipientsCount}{' '}
													{stats.recipientsCount === 1
														? translator.t('countries-page.recipient-singular')
														: translator.t('countries-page.recipient-plural')}
												</p>
											</div>
										</div>
									</div>
								</NextLink>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};
