'use client';
import { useScreenSize } from '@/hooks/useScreenSize';
import { Card, CardFooter, CardHeader, Carousel, CarouselContent, Typography } from '@socialincome/ui';
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
		<Card className="flex min-h-[15rem] flex-col rounded-none border-x-0 border-y-2 bg-inherit my-10">
			<CardHeader>
				<Typography size="2xl" color="foreground">
					{text}
				</Typography>
			</CardHeader>
			<CardFooter className=" flex items-center space-x-6 justify-self-end">
				<Image className="h-14 w-14 rounded-full bg-gray-50" src={image} alt={`${name} Image`} />
				<Typography size="sm" color="foreground">
					{name}, {country}
				</Typography>
			</CardFooter>
		</Card>
	);
}

export function ContributorsPeopleCarouselv2({ portraits }: { portraits: PortraitProps[] }) {
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
