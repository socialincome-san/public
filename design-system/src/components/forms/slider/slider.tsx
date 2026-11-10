'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../../cn';
import { type WithoutClassName } from '../../../without-class-name';

const trackVariants = cva('bg-muted relative grow overflow-hidden rounded-full', {
	variants: {
		size: {
			default: 'data-[orientation=horizontal]:h-1.5',
			lg: 'data-[orientation=horizontal]:h-2',
		},
	},
});

const thumbVariants = cva(
	'block shrink-0 rounded-full transition-[box-shadow,transform] focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			size: {
				default:
					'bg-primary-foreground border-primary ring-ring/50 size-4 border shadow-xs hover:ring-4 focus-visible:ring-4',
				// Hero size: the borderless white thumb of the Switch, scaled up
				lg: 'bg-background border-foreground/15 shadow-foreground/40 ring-ring/20 focus-visible:ring-ring/40 size-8 border shadow-md hover:ring-6 focus-visible:ring-6 active:scale-110 motion-reduce:active:scale-100',
			},
		},
	},
);

type SliderProps = WithoutClassName<React.ComponentProps<typeof SliderPrimitive.Root>> & VariantProps<typeof trackVariants>;

const Slider = ({ defaultValue, value, min = 0, max = 100, size = 'default', ...props }: SliderProps) => {
	const _values = React.useMemo(() => {
		if (Array.isArray(value)) {
			return value;
		}
		if (Array.isArray(defaultValue)) {
			return defaultValue;
		}

		return [min, max];
	}, [value, defaultValue, min, max]);

	return (
		<SliderPrimitive.Root
			data-slot="slider"
			defaultValue={defaultValue}
			value={value}
			min={min}
			max={max}
			className={cn(
				'relative flex w-full touch-none items-center select-none',
				'data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
				'data-disabled:opacity-50',
			)}
			{...props}
		>
			<SliderPrimitive.Track
				data-slot="slider-track"
				className={cn(
					trackVariants({ size }),
					'data-[orientation=horizontal]:w-full',
					'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5',
				)}
			>
				<SliderPrimitive.Range
					data-slot="slider-range"
					className={cn(
						'absolute',
						'data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
						'bg-[linear-gradient(to_right,hsl(var(--gradient-button-from)),hsl(var(--gradient-button-to)))]',
					)}
				/>
			</SliderPrimitive.Track>

			{Array.from({ length: _values.length }, (_, index) => (
				<SliderPrimitive.Thumb data-slot="slider-thumb" key={index} className={thumbVariants({ size })} />
			))}
		</SliderPrimitive.Root>
	);
};

export { Slider };
