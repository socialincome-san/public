'use client';

import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/carousel';
import { SectionHeading } from '@/components/section-heading';
import { PersonCard } from '@/components/storyblok/shared/person-card';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import { createNewWebsitePersonLink } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';
import { ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';

type PersonCarouselSidebar = {
	title?: string;
	heading?: string;
	description?: string;
};

type Props = {
	persons: ISbStoryData<Person>[];
	sidebar?: PersonCarouselSidebar;
	/** When set, each card links to the person profile under new-website. */
	personLink?: { lang: string; region: string };
	size?: 'default' | 'small';
};

export const PersonCarousel = ({ persons, sidebar, personLink, size = 'default' }: Props) => {
	const [api, setApi] = useState<CarouselApi>();
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
					{sidebar?.heading && (
						<SectionHeading align="left" className="text-foreground mb-0 font-normal break-words md:mb-0">
							{sidebar.heading}
						</SectionHeading>
					)}
					{sidebar?.description && <p className="text-muted-foreground text-lg leading-7">{sidebar.description}</p>}
				</div>
			)}
			<div className={cn('relative min-w-0', hasSidebar ? 'lg:col-span-2' : 'w-full')}>
				<Carousel setApi={setApi} opts={{ align: 'start', loop: persons.length > 1 }}>
					<CarouselContent className="-ml-6">
						{persons.map((person) => (
							<CarouselItem key={person.uuid} className={cn('pl-6', isSmall ? 'basis-[260px]' : 'basis-[305px]')}>
								<PersonCard
									person={person}
									size={size}
									href={personLink ? createNewWebsitePersonLink(person.slug, personLink.lang, personLink.region) : undefined}
								/>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
				{persons.length > 1 && (
					<button
						type="button"
						onClick={() => api?.scrollNext()}
						aria-label="Show next person"
						className="absolute top-1/2 right-6 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0px_4px_28px_0px_rgba(0,30,101,0.12)]"
					>
						<ChevronRightIcon className="size-5" aria-hidden="true" />
					</button>
				)}
			</div>
		</div>
	);
};
