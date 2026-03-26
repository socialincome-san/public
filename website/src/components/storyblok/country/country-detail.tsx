import { Button } from '@/components/button';
import { MakeDonationForm } from '@/components/make-donation-form';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import NextImage from 'next/image';
import NextLink from 'next/link';
import type { CountryStory } from './country.types';
import { getCountryDescription, getCountryIsoCode, getCountryTitle } from './country.utils';

type Props = {
	country: CountryStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	activeProgramsCount: number;
	recipientsCount: number;
};

export const CountryDetail = ({ country, lang, region, activeProgramsCount, recipientsCount }: Props) => {
	const countryDescription = getCountryDescription(country.content);
	const isoCode = getCountryIsoCode(country.content);
	const isoCodeLower = isoCode.toLowerCase();
	const countryTitle = getCountryTitle(country.content);
	const heroImageFilename = country.content.heroImage?.filename;
	const heroImageAlt = country.content.heroImage?.alt ?? countryTitle;

	return (
		<section className="hero-video hero-video-block flex flex-col gap-6">
			<div className="relative aspect-video max-h-[80vh] min-h-112 w-full overflow-hidden rounded-b-3xl bg-black md:min-h-160 md:rounded-b-[56px]">
				{heroImageFilename ? (
					<NextImage src={heroImageFilename} alt={heroImageAlt} fill className="object-cover" priority />
				) : (
					<div className="bg-primary/20 absolute inset-0" />
				)}

				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/15" />

				<div className="w-site-width max-w-content absolute inset-0 z-20 mx-auto flex flex-row items-center justify-between gap-4 text-white">
					<div className="flex max-w-2xl flex-col gap-4 text-white">
						<div className="flex items-center gap-4">
							<NextImage
								src={`/assets/flags/${isoCodeLower}.svg`}
								alt={`${isoCode} flag`}
								width={44}
								height={32}
								className="h-8 w-auto rounded-sm"
							/>
							<h1 className="text-4xl font-bold xl:text-6xl">{countryTitle}</h1>
						</div>
						<div className="flex flex-col gap-1 text-xl">
							<p>
								{activeProgramsCount} active {activeProgramsCount === 1 ? 'program' : 'programs'}
							</p>
							<p>
								{recipientsCount} {recipientsCount === 1 ? 'recipient' : 'recipients'}
							</p>
						</div>
						<div>
							<Button variant="outline" size="lg" asChild>
								<NextLink href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/donate`}>Donate now</NextLink>
							</Button>
						</div>
					</div>
					<div className="hidden shrink-0 lg:block">
						<MakeDonationForm lang={lang} />
					</div>
				</div>
			</div>

			<div className="flex justify-center lg:hidden">
				<MakeDonationForm lang={lang} />
			</div>

			<div className="w-site-width max-w-content mx-auto flex min-h-96 flex-col gap-4 px-6 py-8">
				<h2 className="text-2xl font-semibold">About {countryTitle}</h2>
				<p className="text-base">{countryDescription ?? '-'}</p>
			</div>
		</section>
	);
};
