'use client';

import { PersonCard } from '@/components/storyblok/shared/person-card';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { createWebsitePersonLink } from '@/lib/storyblok/storyblok-utils';
import { cn } from '@socialincome/design-system/cn';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselScrollNextButton,
} from '@socialincome/design-system/data-display/carousel/carousel';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import type { ISbStoryData } from '@storyblok/js';

type PersonCarouselSidebar = {
	title?: string;
	heading?: string;
	description?: string;
};

type Props = {
	persons: ISbStoryData<Person>[];
	sidebar?: PersonCarouselSidebar;
	/** When set, each card links to the person profile. */
	personLink?: { lang: string; currency: WebsiteCurrency };
	size?: 'default' | 'small';
	roleLabels?: Record<string, string>;
	// Shows the "volunteering since" pill on the cards, counted up to this day.
	volunteerDurationUntil?: number;
};

export const PersonCarousel = ({
	persons,
	sidebar,
	personLink,
	size = 'default',
	roleLabels,
	volunteerDurationUntil,
}: Props) => {
	const hasSidebar = Boolean(sidebar?.title ?? sidebar?.heading ?? sidebar?.description);
	const isSmall = size === 'small';

	if (!persons.length) {
		return null;
	}

	return (
		<div className={cn('grid gap-8', hasSidebar ? 'lg:grid-cols-3 lg:items-center' : 'grid-cols-1')}>
			{hasSidebar && (
				<div className="space-y-4 lg:col-span-1">
					{sidebar?.title && <p className="text-foreground text-4xl font-bold break-words">{sidebar.title}</p>}
					{sidebar?.heading && <SectionHeading align="left">{sidebar.heading}</SectionHeading>}
					{sidebar?.description && <p className="text-muted-foreground text-lg leading-7">{sidebar.description}</p>}
				</div>
			)}
			<div className={cn('min-w-0', hasSidebar ? 'lg:col-span-2' : 'w-full')}>
				<Carousel opts={{ align: 'start', loop: persons.length > 1 }} gap="lg">
					<CarouselContent>
						{persons.map((person) => (
							<CarouselItem key={person.uuid} size={isSmall ? 'card-sm' : 'card'}>
								<PersonCard
									person={person}
									size={size}
									href={personLink ? createWebsitePersonLink(person.slug, personLink.lang, personLink.currency) : undefined}
									roleLabels={roleLabels}
									volunteerDurationUntil={volunteerDurationUntil}
								/>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselScrollNextButton aria-label="Show next person" />
				</Carousel>
			</div>
		</div>
	);
};
