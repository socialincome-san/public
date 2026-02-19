'use client';

import { useScreenSize } from '@/lib/hooks/useScreenSize';
import { Carousel, CarouselContent } from '@socialincome/ui';
import Image from 'next/image';
import Link from 'next/link';
import githubSVG from '../(assets)/github.svg';
import googlenonprofitSVG from '../(assets)/googlenonprofit.svg';
import govSVG from '../(assets)/gov.svg';
import microsoftSVG from '../(assets)/microsoft.svg';
import milkSVG from '../(assets)/milk.svg';
import smartiveSVG from '../(assets)/smartive.svg';

export const OrgsPartnershipCarousel = () => {
	const screenSize = useScreenSize();

	const companyLogos = [
		{ logo: govSVG, name: 'FDFA', url: 'https://www.fdfa.admin.ch' },
		{ logo: smartiveSVG, name: 'Smartive', url: 'https://smartive.ch' },
		{ logo: googlenonprofitSVG, name: 'Google Nonprofit', url: 'https://www.google.com/nonprofits/' },
		{ logo: githubSVG, name: 'GitHub', url: 'https://github.com' },
		{ logo: microsoftSVG, name: 'Microsoft', url: 'https://www.microsoft.com' },
		{ logo: milkSVG, name: 'Milk', url: 'https://milkinteractive.ch' },
	];

	let slidesToScroll;
	switch (screenSize) {
		case null:
		case 'xs':
		case 'sm':
			slidesToScroll = 2;
			break;
		case 'md':
			slidesToScroll = 4;
			break;
		default:
			slidesToScroll = 5;
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
				<CarouselContent key={index} className="aspect-video p-8">
					<Link href={entry.url} target="_blank">
						<Image src={entry.logo} alt={`${entry.name} Logo`} className="h-full object-contain" />
					</Link>
				</CarouselContent>
			))}
		</Carousel>
	);
}
