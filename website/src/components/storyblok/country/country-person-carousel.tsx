import { Carousel, CarouselContent, CarouselItem, CarouselScrollNextButton } from '@/components/carousel';
import { services } from '@/lib/services/services';
import type { CountryStory } from './country.types';
import { getCountryIsoCode, getCountryTitle } from './country.utils';
import { PersonCard } from './person-card';
import { BlockWrapper } from '@/components/block-wrapper';

type Props = {
	country: CountryStory;
};

export const CountryPersonCarousel = async ({ country }: Props) => {
	const isoCode = getCountryIsoCode(country.content);
	const countryOfficePersonsResult = await services.storyblok.getPersonsByCountryOffice(country.lang, isoCode);
	const persons = countryOfficePersonsResult.success ? countryOfficePersonsResult.data : [];

	if (persons.length === 0) {
		return null;
	}

	const countryName = getCountryTitle(country.content);
	const countryOfficeTitle = country.content.countryOfficeTitle?.trim();
	const countryOfficeDescription = country.content.countryOfficeDescription?.trim();

	return (
		<BlockWrapper>
			<div className="grid gap-8 lg:grid-cols-3 lg:items-center">
				<div className="space-y-4 lg:col-span-1 pr-8 lg:pr-0">
					{countryOfficeTitle ? <p className="text-foreground text-4xl mb-0 font-bold break-words">{countryOfficeTitle}</p> : null}
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
						<CarouselScrollNextButton aria-label="Show next person" />
					</Carousel>
				</div>
			</div>
		</BlockWrapper>
	);
};
