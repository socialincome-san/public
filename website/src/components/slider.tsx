'use client';

import { cn } from '@/lib/utils/cn';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';

const Slider = ({
	className,
	defaultValue,
	value,
	min = 0,
	max = 100,
	...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) => {
	const _values = React.useMemo(
		() => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
		[value, defaultValue, min, max],
	);

	return (
		<SliderPrimitive.Root
			data-slot="slider"
			defaultValue={defaultValue}
			value={value}
			min={min}
			max={max}
			className={cn(
				'relative flex w-full touch-none select-none items-center',
				'data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
				'data-[disabled]:opacity-50',
				className,
			)}
			{...props}
		>
			<SliderPrimitive.Track
				data-slot="slider-track"
				className={cn(
					'bg-muted relative grow overflow-hidden rounded-full',
					'data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full',
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
				<SliderPrimitive.Thumb
					data-slot="slider-thumb"
					key={index}
					className={cn(
						'block size-4 shrink-0 rounded-full bg-white',
						'border-primary border shadow-sm',
						'transition-[box-shadow]',
						'ring-ring/50 hover:ring-4',
						'focus-visible:outline-none focus-visible:ring-4',
						'disabled:pointer-events-none disabled:opacity-50',
					)}
				/>
			))}
		</SliderPrimitive.Root>
	);
};

export { Slider };
