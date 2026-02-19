'use client';
import { Carousel, CarouselContent, Typography } from '@socialincome/ui';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import Image from 'next/image';

export type CarouselCardProps = {
	quote: {
		text: string;
		color: FontColor;
	}[];
	logo: string;
	author: string;
}[];

export const QuotesCarousel = (cardsObj: CarouselCardProps) => {
	let cardsArr = [];
	for (const index in cardsObj) {
		cardsArr.push(cardsObj[index]);
	}

	// TODO: update carousel content
	return (
		<Carousel
			options={{
				loop: false,
				autoPlay: { enabled: true, delay: 5000 },
				slidesToScroll: 1,
			}}
			showDots={true}
		>
			{cardsArr.map((card, index) => (
				<CarouselContent key={index} className="flex flex-col items-center">
					<Typography size="3xl" className="w-4/5 text-center">
						{card.quote.map((title, index) => (
							<Typography as="span" color={title.color} key={index}>
								{title.text}{' '}
							</Typography>
						))}
					</Typography>
					<Image src={card.logo} alt={card.author} width="48" height="48" className="mb-3 mt-5 h-auto w-12" />
					<Typography size="sm" className="mb-12">
						{card.author}
					</Typography>
				</CarouselContent>
			))}
		</Carousel>
	);
};
