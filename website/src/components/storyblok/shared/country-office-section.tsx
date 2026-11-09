import { PersonCard } from '@/components/storyblok/shared/person-card';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import {
	getPersonsByCountryOfficeAction,
	getPrimaryRoleLabelsAction,
} from '@/modules/storyblok-content/storyblok-content.actions';
import { cn } from '@socialincome/design-system/cn';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselScrollNextButton,
} from '@socialincome/design-system/data-display/carousel/carousel';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { PageIntro } from '@socialincome/design-system/layout/page-intro/page-intro';
import { getTranslations } from 'next-intl/server';
import type { ComponentProps } from 'react';

type Props = {
	isoCode: string;
	title?: string;
	heading: string;
	description?: string;
	lang: WebsiteLanguage;
	wrapperProps?: ComponentProps<typeof BlockWrapper>;
};

export const CountryOfficeSection = async ({ isoCode, title, heading, description, lang, wrapperProps }: Props) => {
	const [personsResult, roleLabelsResult] = await Promise.all([
		getPersonsByCountryOfficeAction({ language: lang, values: [isoCode] }),
		getPrimaryRoleLabelsAction(lang),
	]);
	const persons = personsResult.success ? personsResult.data : [];
	const roleLabels = roleLabelsResult.success ? roleLabelsResult.data : {};

	if (persons.length === 0) {
		return null;
	}

	// A carousel with one or two cards leaves a wide empty gap, so small teams get a centered grid instead.
	const isSmallTeam = persons.length <= 2;

	return (
		<BlockWrapper {...wrapperProps}>
			<div className={cn('grid gap-8 lg:items-center', isSmallTeam ? 'lg:grid-cols-2' : 'lg:grid-cols-3')}>
				<div className="pr-8 lg:pr-0">
					<PageIntro variant="section" eyebrow={title} title={heading} description={description} />
				</div>
				{isSmallTeam ? (
					<ul className="grid gap-6 sm:grid-cols-2">
						{persons.map((person) => (
							<li key={person.uuid}>
								<PersonCard person={person} roleLabels={roleLabels} />
							</li>
						))}
					</ul>
				) : (
					<div className="relative min-w-0 lg:col-span-2">
						<Carousel opts={{ align: 'start' }} gap="lg">
							<CarouselContent>
								{persons.map((person) => (
									<CarouselItem key={person.uuid} size="card">
										<PersonCard person={person} roleLabels={roleLabels} />
									</CarouselItem>
								))}
							</CarouselContent>
							<CarouselScrollNextButton
								aria-label={(await getTranslations('website-common'))('countries-page.person-carousel-next-button-aria')}
							/>
						</Carousel>
					</div>
				)}
			</div>
		</BlockWrapper>
	);
};
