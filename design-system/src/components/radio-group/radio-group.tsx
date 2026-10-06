'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { CircleIcon } from 'lucide-react';
import * as React from 'react';
import { type WithoutClassName } from '../../without-class-name';

const radioGroupVariants = cva('', {
	variants: {
		layout: {
			stack: 'grid gap-3',
			row: 'flex flex-wrap gap-4',
			grid: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
			// Items bring their own dividers and spacing
			list: 'grid min-w-0',
		},
	},
	defaultVariants: {
		layout: 'stack',
	},
});

const RadioGroup = ({
	layout,
	...props
}: WithoutClassName<React.ComponentProps<typeof RadioGroupPrimitive.Root>> & VariantProps<typeof radioGroupVariants>) => {
	return <RadioGroupPrimitive.Root data-slot="radio-group" className={radioGroupVariants({ layout })} {...props} />;
};

const RadioGroupItem = (props: WithoutClassName<React.ComponentProps<typeof RadioGroupPrimitive.Item>>) => {
	return (
		<RadioGroupPrimitive.Item
			data-slot="radio-group-item"
			className="border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive aspect-square size-4 shrink-0 rounded-full border shadow-xs outline-hidden transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
			{...props}
		>
			<RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className="relative flex items-center justify-center">
				<CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	);
};

export { RadioGroup, RadioGroupItem };
