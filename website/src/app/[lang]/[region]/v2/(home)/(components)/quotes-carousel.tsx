'use client';
import { useScreenSize } from '@/hooks/useScreenSize';
import { Carousel, CarouselContent, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';
import UNImageData from '../(assets)/UN symbol.png';

export type CarouselCardProps = {
	quote: {
		text: string;
		color: FontColor;
	}[];
	icon: ImageData | string;
	author: string;
}[];

export function QuotesCarousel(cardsObj: CarouselCardProps) {
	const screenSize = useScreenSize();
	let cardsArr = [];
	for (const index in cardsObj) {
		cardsArr.push(cardsObj[index]);
	}

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
			{cardsArr.map((card, index) => (
				<CarouselContent key={index} className="flex basis-full flex-col items-center justify-center">
					<div className="w-3/4 self-center text-center">
						{card.quote.map((title, index) => (
							<Typography as="span" size="2xl" weight="medium" color={title.color} key={index}>
								{title.text}{' '}
							</Typography>
						))}
					</div>
					<Image src={UNImageData} alt="UN symbol" className="mb-3 mt-5 h-12 w-12" />
					<Typography size="sm" className="mb-12">
						{card.author}
					</Typography>
				</CarouselContent>
			))}
		</Carousel>
	);
}
