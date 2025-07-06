'use client';

import { useScreenSize } from '@/lib/hooks/useScreenSize';
import { Carousel, CarouselContent, Typography } from '@socialincome/ui';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';

type PortraitProps = {
	name: string;
	text: string;
	country: string;
	image: string | StaticImport;
};

function Portrait({ name, text, country, image }: PortraitProps) {
	return (
		<div className="mb-16 px-1">
			<div className="flex h-64 flex-col justify-between border-b-2 border-t-2 py-4 md:h-72">
				<Typography size="2xl" weight="normal" color="foreground">
					{text}
				</Typography>
				<div className="flex items-center">
					<Image className="mr-4 h-14 w-14 rounded-full bg-gray-50" src={image} alt={`${name} Image`} />
					<Typography size="sm" color="foreground">
						{name}, {country}
					</Typography>
				</div>
			</div>
		</div>
	);
}

export function ContributorsCarousel({ portraits }: { portraits: PortraitProps[] }) {
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
			showDots={true}
		>
			{portraits.map((portrait, index) => (
				<CarouselContent key={index} className="px-2">
					<Portrait {...portrait} />
				</CarouselContent>
			))}
		</Carousel>
	);
}
