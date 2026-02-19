'use client';

import { useScreenSize } from '@/lib/hooks/useScreenSize';
import { MapPinIcon } from '@heroicons/react/24/solid';
import { Card, CardContent, CardFooter, CardHeader, Carousel, CarouselContent, Typography } from '@socialincome/ui';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import doubleQuotesSVG from '../(assets)/double-quotes.svg';

type PortraitProps = {
	name: string;
	text: string;
	country: string;
	image: string | StaticImport;
};

const Portrait = ({ name, text, country, image }: PortraitProps) => {
	return (
		<Card className="flex min-h-[24rem] flex-col">
			<CardHeader>
				<Image src={doubleQuotesSVG} alt="Double quotes" className="text-accent h-16 w-16" />
			</CardHeader>
			<CardContent className="flex-grow">
				<Typography weight="normal">{text}</Typography>
			</CardContent>
			<CardFooter className="mt-4 flex items-center space-x-6 justify-self-end">
				<Image className="h-14 w-14 rounded-full bg-gray-50" src={image} alt={`${name} Image`} />
				<div className="space-y-1">
					<Typography weight="bold">{name}</Typography>
					<div className="flex-inline flex items-center">
						<MapPinIcon className="text-primary mr-0.5 h-5 w-5" />
						<Typography color="muted-foreground">{country}</Typography>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
};

export const ContributorsPeopleCarousel = ({ portraits }: { portraits: PortraitProps[] }) => {
	const screenSize = useScreenSize();

	let slidesToScroll;
	switch (screenSize) {
		case null:
		case 'xs':
			slidesToScroll = 1;
			break;
		case 'sm':
		case 'md':
			slidesToScroll = 2;
			break;
		default:
			slidesToScroll = 3;
			break;
	}

	return (
		<Carousel
			options={{
				loop: false,
				autoPlay: { enabled: true, delay: 5000 },
				slidesToScroll: slidesToScroll,
			}}
			showControls
		>
			{portraits.map((portrait, index) => (
				<CarouselContent key={index} className="px-2">
					<Portrait {...portrait} />
				</CarouselContent>
			))}
		</Carousel>
	);
};
