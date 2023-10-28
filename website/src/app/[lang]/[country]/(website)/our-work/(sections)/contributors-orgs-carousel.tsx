'use client';

import { useScreenSize } from '@/hooks/useScreenSize';
import { Carousel, CarouselContent } from '@socialincome/ui';
import Image from 'next/image';
import epflSVG from '../(assets)/epfl.svg';
import govSVG from '../(assets)/gov.svg';
import mckinseySVG from '../(assets)/mckinsey.svg';
import microsoftSVG from '../(assets)/microsoft.svg';
import r17SVG from '../(assets)/r17.svg';
import srgSVG from '../(assets)/srg.svg';
import unSVG from '../(assets)/un.svg';

export function ContributorsOrgsCarousel() {
	const screenSize = useScreenSize();

	const companyLogos = [
		{ logo: govSVG, name: 'FDFA' },
		{ logo: microsoftSVG, name: 'Microsoft' },
		{ logo: mckinseySVG, name: 'McKinsey' },
		{ logo: unSVG, name: 'UN' },
		{ logo: srgSVG, name: 'SRG' },
		{ logo: epflSVG, name: 'EPFL' },
		{ logo: r17SVG, name: 'R17' },
	];

	let slidesToScroll;
	switch (screenSize) {
		case 'xs':
		case 'sm':
			slidesToScroll = 2;
			break;
		case 'md':
			slidesToScroll = 3;
			break;
		default:
			slidesToScroll = 4;
			break;
	}

	return (
		<Carousel
			options={{
				loop: false,
				autoPlay: { enabled: true },
				slidesToScroll: slidesToScroll,
			}}
			showDots
		>
			{companyLogos.map((entry, index) => (
				<CarouselContent key={index} className="aspect-video p-4">
					<Image src={entry.logo} alt={`${entry.name} Logo`} className="h-full object-contain" />
				</CarouselContent>
			))}
		</Carousel>
	);
}
