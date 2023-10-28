'use client';

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
		<Card className="flex flex-col space-y-8 md:flex-row md:space-y-0">
			<div className="flex basis-1/2 flex-col items-center">
				<Image
					src={image}
					alt={`${name} Image`}
					className="max-h-[32rem] flex-grow rounded-sm object-contain md:max-h-full"
				/>
			</div>
			<div className="basis-1/2 space-y-8 p-8">
				<Image src={doubleQuotesSVG} alt="double quotes" className="text-si-yellow h-16 w-16" />
				<Typography size="2xl" weight="semibold">
					{text}
				</Typography>
				<div>
					<Typography size="xl">{name}</Typography>
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
	return (
		<Carousel
			options={{
				loop: false,
				autoPlay: { enabled: true, delay: 6000 },
				slidesToScroll: 1,
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
}
