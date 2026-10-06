import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { type WithoutClassName } from '../../without-class-name';

const cardVariants = cva('relative overflow-hidden rounded-3xl transition-all', {
	variants: {
		padding: {
			default: 'px-6 py-8 sm:p-10',
			compact: 'p-6',
			none: '',
		},
		elevation: {
			raised: 'shadow-lg',
			// Bordered, for cards stacked inside forms or on muted backgrounds
			flat: 'border-border border shadow-sm',
		},
		surface: {
			default: 'bg-background',
			gradient: 'bg-donation-modal-gradient',
		},
		// Lifts on hover, for cards wrapped in a link
		interactive: {
			true: 'hover:-translate-y-1 hover:shadow-xl',
		},
		fullHeight: {
			true: 'h-full',
		},
	},
	defaultVariants: {
		padding: 'default',
		elevation: 'raised',
		surface: 'default',
	},
});

type CardProps = WithoutClassName<React.HTMLAttributes<HTMLDivElement>> & VariantProps<typeof cardVariants>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ padding, elevation, surface, interactive, fullHeight, ...props }, ref) => (
		<div ref={ref} className={cardVariants({ padding, elevation, surface, interactive, fullHeight })} {...props} />
	),
);

Card.displayName = 'Card';

export { Card };
