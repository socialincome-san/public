'use client';

import { useId } from 'react';
import { cn } from '../../../cn';
import { Slider } from '../slider/slider';

type AmountSliderProps = {
	label: string;
	currency: string;
	value: number;
	// The value as shown, formatted for the visitor's locale
	formattedValue: string;
	min: number;
	max: number;
	step?: number;
	onValueChange: (value: number) => void;
	// Faded while another way of choosing the amount is in use
	inactive?: boolean;
	// Called on the first touch, focus or key press, e.g. to make this input the active one
	onActivate?: () => void;
};

export const AmountSlider = ({
	label,
	currency,
	value,
	formattedValue,
	min,
	max,
	step = 1,
	onValueChange,
	inactive = false,
	onActivate,
}: AmountSliderProps) => {
	const labelId = useId();

	return (
		<div
			className={cn('flex w-full flex-col items-start gap-2 transition-opacity', inactive && 'opacity-40')}
			onPointerDown={onActivate}
			onFocus={onActivate}
		>
			<span id={labelId} className="text-muted-foreground text-sm font-medium">
				{label}
			</span>
			<div className="flex items-baseline gap-2.5 sm:gap-3">
				<span className="text-muted-foreground text-lg leading-none sm:text-xl">{currency}</span>
				<output
					aria-labelledby={labelId}
					className="text-primary text-5xl leading-none font-medium tracking-tight sm:text-6xl lg:text-7xl"
				>
					{formattedValue}
				</output>
			</div>
			<div className="w-full max-w-140 pt-4">
				<Slider
					size="lg"
					value={[value]}
					min={min}
					max={max}
					step={step}
					aria-labelledby={labelId}
					aria-valuetext={`${currency} ${formattedValue}`}
					onValueChange={([next]) => {
						if (next !== undefined) {
							onValueChange(next);
						}
					}}
				/>
			</div>
		</div>
	);
};
