'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Autoplay, { AutoplayOptionsType } from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel/components/Options';
import React, { useContext, useEffect } from 'react';
import { cn } from '../lib/utils';

export const CarouselContext = React.createContext<EmblaOptionsType>({});

type CarouselProps = {
	options?: EmblaOptionsType & { autoPlay?: { enabled: boolean } & AutoplayOptionsType };
	showDots?: boolean;
	showControls?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export const Carousel = ({
	children,
	className,
	options = {},
	showDots = false,
	showControls = false,
	...props
}: CarouselProps) => {
	const [emblaRef, emblaApi] = useEmblaCarousel(
		options,
		options?.autoPlay?.enabled ? [Autoplay(options.autoPlay)] : [],
	);
	const [emblaOptions, setEmblaOptions] = React.useState<EmblaOptionsType>(options);
	const [selectedIndex, setSelectedIndex] = React.useState(0);
	const slidesCount = React.Children.count(children);

	useEffect(() => {
		function selectHandler() {
			const index = emblaApi?.selectedScrollSnap();
			setSelectedIndex(index || 0);
		}

		emblaApi?.on('select', selectHandler);

		return () => {
			emblaApi?.off('select', selectHandler);
		};
	}, [emblaApi]);

	useEffect(() => {
		setEmblaOptions(options);
	}, [options]);

	return (
		<CarouselContext.Provider value={emblaOptions}>
			<div className={cn('relative', { 'px-8': showControls })}>
				<div className={cn('overflow-hidden', className)} ref={emblaRef} {...props}>
					<div className="flex">{children}</div>
					{showDots && (
						<CarouselDots
							itemsLength={Math.ceil(slidesCount / (Number(options.slidesToScroll) || 1))}
							selectedIndex={selectedIndex}
							onClick={(index) => emblaApi?.scrollTo(index)}
						/>
					)}
					{showControls && (
						<CarouselControls
							canScrollNext={!!emblaApi?.canScrollNext()}
							canScrollPrev={!!emblaApi?.canScrollPrev()}
							onNext={() => emblaApi?.scrollNext()}
							onPrev={() => emblaApi?.scrollPrev()}
						/>
					)}
				</div>
			</div>
		</CarouselContext.Provider>
	);
};

export const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ children, className, ...props }, ref) => {
		const options = useContext(CarouselContext);
		return (
			<div
				ref={ref}
				className={cn(
					'relative flex-shrink-0 flex-grow-0',
					{
						auto: 'auto',
						1: 'basis-full',
						2: 'basis-1/2',
						3: 'basis-1/3',
						4: 'basis-1/4',
						5: 'basis-1/5',
						6: 'basis-1/6',
					}[options?.slidesToScroll || 'auto'],
					className,
				)}
				{...props}
			>
				{children}
			</div>
		);
	},
);

type CarouselDots = {
	itemsLength: number;
	selectedIndex: number;
	onClick?: (index: number) => void;
};

const CarouselDots = ({ itemsLength, selectedIndex, onClick }: CarouselDots) => {
	const arr = new Array(itemsLength).fill(0);
	return (
		<div className="my-2 flex -translate-y-5 justify-center gap-1">
			{arr.map((_, index) => {
				const selected = index === selectedIndex;
				return (
					<div
						key={index}
						className={cn('bg-muted-foreground h-2 w-2 rounded-full transition-all duration-300', {
							'opacity-50': !selected,
							'cursor-pointer': onClick,
						})}
						onClick={() => onClick?.(index)}
					></div>
				);
			})}
		</div>
	);
};

type Props = {
	canScrollPrev: boolean;
	canScrollNext: boolean;
	onPrev(): void;
	onNext(): void;
};
const CarouselControls = (props: Props) => {
	return (
		<>
			<div className="absolute inset-y-0 left-0 flex items-center">
				<ChevronLeftIcon className="text-muted-foreground my-auto h-8 w-8 cursor-pointer" onClick={props.onPrev} />
			</div>
			<div className="absolute inset-y-0 right-0 flex items-center">
				<ChevronRightIcon className="text-muted-foreground my-auto h-8 w-8 cursor-pointer" onClick={props.onNext} />
			</div>
		</>
	);
};
