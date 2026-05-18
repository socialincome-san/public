'use client';

import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/carousel';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { ISbStoryData } from '@storyblok/js';
import { ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';
import { PersonCard } from './person-card';

type Props = {
	persons: ISbStoryData<Person>[];
	countryName: string;
	countryOfficeTitle?: string;
	countryOfficeDescription?: string;
};

export const CountryPersonCarousel = ({ persons, countryName, countryOfficeTitle, countryOfficeDescription }: Props) => {
	const [api, setApi] = useState<CarouselApi>();

	return (
		<div className="grid gap-8 lg:grid-cols-3 lg:items-center">
			<div className="space-y-4 lg:col-span-1">
				{countryOfficeTitle ? <p className="text-foreground text-4xl font-bold break-words">{countryOfficeTitle}</p> : null}
				<h2 className="text-foreground text-4xl font-normal break-words">{countryName}</h2>
				{countryOfficeDescription ? (
					<p className="text-muted-foreground text-lg leading-7">{countryOfficeDescription}</p>
				) : null}
			</div>
			<div className="relative min-w-0 lg:col-span-2">
				<Carousel setApi={setApi} opts={{ align: 'start' }}>
					<CarouselContent className="-ml-6">
						{persons.map((person) => (
							<CarouselItem key={person.uuid} className="basis-[305px] pl-6">
								<PersonCard person={person} />
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
				<button
					type="button"
					onClick={() => api?.scrollNext()}
					aria-label="Show next person"
					className="absolute top-1/2 right-6 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0px_4px_28px_0px_rgba(0,30,101,0.12)]"
				>
					<ChevronRightIcon className="size-5" aria-hidden="true" />
				</button>
			</div>
		</div>
	);
};
