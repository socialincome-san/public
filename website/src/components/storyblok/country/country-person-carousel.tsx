import { BlockWrapper } from '@/components/block-wrapper';
import { Carousel, CarouselContent, CarouselItem, CarouselScrollNextButton } from '@/components/carousel';
import { PersonCard } from '@/components/storyblok/shared/person-card';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { CountryStory } from './country.types';
import { getCountryIsoCode, getCountryTitle } from './country.utils';

type Props = {
	country: CountryStory;
	lang: WebsiteLanguage;
};

export const CountryPersonCarousel = async ({ country, lang }: Props) => {
	const isoCode = getCountryIsoCode(country.content);
	const countryOfficePersonsResult = await services.storyblok.getPersonsByCountryOffice(lang, isoCode);
	const persons = countryOfficePersonsResult.success ? countryOfficePersonsResult.data : [];

	if (persons.length === 0) {
		return null;
	}

	const countryName = getCountryTitle(country.content);
	const countryOfficeTitle = country.content.countryOfficeTitle?.trim();
	const countryOfficeDescription = country.content.countryOfficeDescription?.trim();
	const hasMultiplePersons = persons.length > 1;
	const nextButtonAriaLabel = hasMultiplePersons
		? (await Translator.getInstance({ language: lang, namespaces: ['website-common'] })).t(
				'countries-page.person-carousel-next-button-aria',
			)
		: '';

	return (
		<BlockWrapper>
			<div className="grid gap-8 lg:grid-cols-3 lg:items-center">
				<div className="space-y-4 pr-8 lg:col-span-1 lg:pr-0">
					{countryOfficeTitle ? (
						<p className="text-foreground mb-0 text-4xl font-bold break-words">{countryOfficeTitle}</p>
					) : null}
					<h2 className="text-foreground text-4xl font-normal break-words">{countryName}</h2>
					{countryOfficeDescription ? (
						<p className="text-muted-foreground text-base leading-7">{countryOfficeDescription}</p>
					) : null}
				</div>
				<div className="relative min-w-0 lg:col-span-2">
					<Carousel opts={{ align: 'start' }}>
						<CarouselContent className="-ml-6">
							{persons.map((person) => (
								<CarouselItem key={person.uuid} className="basis-[305px] pl-6">
									<PersonCard person={person} />
								</CarouselItem>
							))}
						</CarouselContent>
						{hasMultiplePersons ? <CarouselScrollNextButton aria-label={nextButtonAriaLabel} /> : null}
					</Carousel>
				</div>
			</div>
		</BlockWrapper>
	);
};
