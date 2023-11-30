'use client';

import { Carousel, CarouselContent } from '@socialincome/ui';
import Image from 'next/image';

import { useScreenSize } from '@/hooks/useScreenSize';
import dezaSVG from './(assets)/deza.svg';
import innosuissseSVG from './(assets)/innosuisse.svg';
import liaSVG from './(assets)/lia.svg';
import whatsappSVG from './(assets)/whatsapp.svg';

export function Section7Carousel() {
	const screenSize = useScreenSize();
	if (!screenSize) return null;

	const logos = [
		{ logo: liaSVG, name: 'LIA' },
		{ logo: whatsappSVG, name: 'WhatsApp' },
		{ logo: innosuissseSVG, name: 'Innosuisse' },
		{ logo: dezaSVG, name: 'DEZA' },
	];

	let slidesToScroll;
	switch (screenSize) {
		case 'xs':
			slidesToScroll = 1;
			break;
		case 'sm':
			slidesToScroll = 2;
			break;
		default:
			slidesToScroll = 3;
	}

	return (
		<Carousel
			options={{
				loop: true,
				autoPlay: { enabled: true },
				slidesToScroll: slidesToScroll,
			}}
			showDots
		>
			{logos.map((entry, index) => (
				<CarouselContent key={index} className="p-4 px-16 sm:px-4">
					<Image src={entry.logo} alt={`${entry.name} Logo`} className="w-full object-contain sm:w-2/3" />
				</CarouselContent>
			))}
		</Carousel>
	);
}
