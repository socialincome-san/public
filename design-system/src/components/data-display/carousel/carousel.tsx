'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { ChevronRightIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../../cn';
import { type WithoutClassName } from '../../../without-class-name';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselGap = 'none' | 'default' | 'lg';

type CarouselProps = {
	opts?: CarouselOptions;
	plugins?: CarouselPlugin;
	orientation?: 'horizontal' | 'vertical';
	gap?: CarouselGap;
	setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
	carouselRef: ReturnType<typeof useEmblaCarousel>[0];
	api: ReturnType<typeof useEmblaCarousel>[1];
	scrollPrev: () => void;
	scrollNext: () => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
	const context = React.useContext(CarouselContext);

	if (!context) {
		throw new Error('useCarousel must be used within a <Carousel />');
	}

	return context;
}

const Carousel = React.forwardRef<HTMLDivElement, WithoutClassName<React.HTMLAttributes<HTMLDivElement>> & CarouselProps>(
	({ orientation = 'horizontal', gap = 'default', opts, setApi, plugins, children, ...props }, ref) => {
		const [carouselRef, api] = useEmblaCarousel(
			{
				...opts,
				axis: orientation === 'horizontal' ? 'x' : 'y',
			},
			plugins,
		);
		const [canScrollPrev, setCanScrollPrev] = React.useState(false);
		const [canScrollNext, setCanScrollNext] = React.useState(false);

		const onSelect = React.useCallback((api: CarouselApi) => {
			if (!api) {
				return;
			}

			setCanScrollPrev(api.canScrollPrev());
			setCanScrollNext(api.canScrollNext());
		}, []);

		const scrollPrev = React.useCallback(() => {
			api?.scrollPrev();
		}, [api]);

		const scrollNext = React.useCallback(() => {
			api?.scrollNext();
		}, [api]);

		const handleKeyDown = React.useCallback(
			(event: React.KeyboardEvent<HTMLDivElement>) => {
				if (event.key === 'ArrowLeft') {
					event.preventDefault();
					scrollPrev();
				} else if (event.key === 'ArrowRight') {
					event.preventDefault();
					scrollNext();
				}
			},
			[scrollPrev, scrollNext],
		);

		React.useEffect(() => {
			if (!api || !setApi) {
				return;
			}

			setApi(api);
		}, [api, setApi]);

		React.useEffect(() => {
			if (!api) {
				return;
			}

			let didCancel = false;

			queueMicrotask(() => {
				if (didCancel) {
					return;
				}

				onSelect(api);
			});
			api.on('reInit', onSelect);
			api.on('select', onSelect);

			return () => {
				didCancel = true;
				api?.off('select', onSelect);
				api?.off('reInit', onSelect);
			};
		}, [api, onSelect]);

		return (
			<CarouselContext.Provider
				value={{
					carouselRef,
					api: api,
					opts,
					orientation: orientation,
					gap,
					scrollPrev,
					scrollNext,
					canScrollPrev,
					canScrollNext,
				}}
			>
				<div
					ref={ref}
					onKeyDownCapture={handleKeyDown}
					className="relative"
					role="region"
					aria-roledescription="carousel"
					{...props}
				>
					{children}
				</div>
			</CarouselContext.Provider>
		);
	},
);
Carousel.displayName = 'Carousel';

// The track pulls back by the slide padding so the first slide stays aligned with the content edge
const trackGapClasses: Record<'horizontal' | 'vertical', Record<CarouselGap, string>> = {
	horizontal: { none: '', default: '-ml-4', lg: '-ml-6' },
	vertical: { none: '', default: '-mt-4', lg: '-mt-6' },
};

const slideGapClasses: Record<'horizontal' | 'vertical', Record<CarouselGap, string>> = {
	horizontal: { none: '', default: 'pl-4', lg: 'pl-6' },
	vertical: { none: '', default: 'pt-4', lg: 'pt-6' },
};

type CarouselContentProps = WithoutClassName<React.HTMLAttributes<HTMLDivElement>> & {
	scrollFade?: boolean;
};

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(({ scrollFade = false, ...props }, ref) => {
	const { carouselRef, orientation = 'horizontal', gap = 'default', canScrollNext } = useCarousel();

	return (
		<div
			ref={carouselRef}
			className={cn('overflow-hidden', scrollFade && orientation === 'horizontal' && canScrollNext && 'scroll-fade-e')}
		>
			<div
				ref={ref}
				className={cn('flex', orientation === 'vertical' && 'flex-col', trackGapClasses[orientation][gap])}
				{...props}
			/>
		</div>
	);
});
CarouselContent.displayName = 'CarouselContent';

const carouselItemVariants = cva('min-w-0 shrink-0 grow-0', {
	variants: {
		size: {
			full: 'basis-full',
			featured: 'basis-full md:basis-4/5 lg:basis-3/5',
			card: 'basis-[305px]',
			'card-sm': 'basis-[260px]',
			tile: 'basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5',
		},
	},
	defaultVariants: {
		size: 'full',
	},
});

const CarouselItem = React.forwardRef<
	HTMLDivElement,
	WithoutClassName<React.HTMLAttributes<HTMLDivElement>> & VariantProps<typeof carouselItemVariants>
>(({ size, ...props }, ref) => {
	const { orientation = 'horizontal', gap = 'default' } = useCarousel();

	return (
		<div
			ref={ref}
			role="group"
			aria-roledescription="slide"
			className={cn(carouselItemVariants({ size }), slideGapClasses[orientation][gap])}
			{...props}
		/>
	);
});
CarouselItem.displayName = 'CarouselItem';

type CarouselScrollNextButtonProps = WithoutClassName<React.ButtonHTMLAttributes<HTMLButtonElement>> & {
	'aria-label': string;
};

const CarouselScrollNextButton = React.forwardRef<HTMLButtonElement, CarouselScrollNextButtonProps>(
	({ disabled, onClick, ...props }, ref) => {
		const { scrollNext, canScrollNext } = useCarousel();
		const isDisabled = disabled ?? !canScrollNext;

		return (
			<button
				ref={ref}
				type="button"
				disabled={isDisabled}
				aria-disabled={isDisabled}
				onClick={(event) => {
					if (isDisabled) {
						return;
					}

					scrollNext();
					onClick?.(event);
				}}
				className="bg-primary-foreground shadow-raised absolute top-1/2 right-6 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full disabled:hidden"
				{...props}
			>
				<ChevronRightIcon className="size-5" aria-hidden="true" />
			</button>
		);
	},
);
CarouselScrollNextButton.displayName = 'CarouselScrollNextButton';

export { Carousel, CarouselContent, CarouselItem, CarouselScrollNextButton, type CarouselApi };
