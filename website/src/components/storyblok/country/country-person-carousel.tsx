import { PersonCard } from '@/components/storyblok/shared/person-card';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import {
	getPersonsByCountryOfficeAction,
	getPrimaryRoleLabelsAction,
} from '@/modules/storyblok-content/storyblok-content.actions';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselScrollNextButton,
} from '@socialincome/design-system/data-display/carousel/carousel';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { getTranslations } from 'next-intl/server';
import type { CountryStory } from './country.types';
import { getCountryIsoCode, getCountryTitle } from './country.utils';

type Props = {
	country: CountryStory;
	lang: WebsiteLanguage;
};

export const CountryPersonCarousel = async ({ country, lang }: Props) => {
	const isoCode = getCountryIsoCode(country.content);
	const [countryOfficePersonsResult, roleLabelsResult] = await Promise.all([
		getPersonsByCountryOfficeAction({ language: lang, values: [isoCode] }),
		getPrimaryRoleLabelsAction(lang),
	]);
	const persons = countryOfficePersonsResult.success ? countryOfficePersonsResult.data : [];
	const roleLabels = roleLabelsResult.success ? roleLabelsResult.data : {};

	if (persons.length === 0) {
		return null;
	}

	const countryName = getCountryTitle(country.content);
	const countryOfficeTitle = country.content.countryOfficeTitle?.trim();
	const countryOfficeDescription = country.content.countryOfficeDescription?.trim();
	const hasMultiplePersons = persons.length > 1;
	const nextButtonAriaLabel = hasMultiplePersons
		? (await getTranslations('website-common'))('countries-page.person-carousel-next-button-aria')
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
					<Carousel opts={{ align: 'start' }} gap="lg">
						<CarouselContent>
							{persons.map((person) => (
								<CarouselItem key={person.uuid} size="card">
									<PersonCard person={person} roleLabels={roleLabels} />
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
