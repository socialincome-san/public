'use client';

import { cn } from '../../../cn';
import { AmountDisplay } from '../../data-display/amount-display/amount-display';
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
	// Called on touch or focus, for example to make this the active choice
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
}: AmountSliderProps) => (
	<div
		className={cn('flex w-full flex-col gap-6 transition-opacity', inactive && 'opacity-40')}
		onPointerDown={onActivate}
		onFocus={onActivate}
	>
		<AmountDisplay label={label} currency={currency} value={formattedValue} />
		<div className="max-w-140">
			<Slider
				size="lg"
				value={[value]}
				min={min}
				max={max}
				step={step}
				aria-label={label}
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
