'use client';

import { useScreenSize } from '@/lib/hooks/useScreenSize';
import { MapPinIcon } from '@heroicons/react/24/solid';
import { Card, Carousel, CarouselContent, Typography } from '@socialincome/ui';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import doubleQuotesSVG from '../(assets)/double-quotes.svg';

type PortraitProps = {
	name: string;
	text: string;
	image: string | StaticImport;
	country: string;
};

function Portrait({ name, text, country, image }: PortraitProps) {
	return (
		<Card className="flex flex-col space-y-2 md:flex-row md:space-y-0">
			<div className="flex flex-col items-center md:basis-1/2">
				<Image
					src={image}
					alt={`${name} Image`}
					className="max-h-[24rem] flex-grow rounded-sm object-contain md:max-h-full"
				/>
			</div>
			<div className="space-y-4 p-4 md:basis-1/2 md:space-y-8 md:p-8">
				<Image src={doubleQuotesSVG} alt="double quotes" className="text-accent h-8 w-8 md:h-16 md:w-16" />
				<Typography size="xl">{text}</Typography>
				<div>
					<Typography size="2xl" weight="medium">
						{name}
					</Typography>
					<div className="flex-inline flex items-center">
						<MapPinIcon className="text-primary mr-1 h-5 w-5" />
						<Typography size="xl" color="muted-foreground">
							{country}
						</Typography>
					</div>
				</div>
			</div>
		</Card>
	);
}

export function RecipientsCarousel({ portraits }: { portraits: PortraitProps[] }) {
	const screenSize = useScreenSize();

	return (
		<Carousel
			options={{
				loop: false,
				autoPlay: { enabled: true, delay: 6000 },
				slidesToScroll: 1,
			}}
			showControls={screenSize !== 'xs'}
		>
			{portraits.map((portrait, index) => (
				<CarouselContent key={index} className="px-2">
					<Portrait {...portrait} />
				</CarouselContent>
			))}
		</Carousel>
	);
}
