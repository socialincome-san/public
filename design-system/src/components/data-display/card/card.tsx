import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { type WithoutClassName } from '../../../without-class-name';

const cardVariants = cva('relative overflow-hidden rounded-3xl transition-all', {
	variants: {
		padding: {
			default: 'px-6 py-8 sm:p-10',
			compact: 'p-6',
			none: '',
		},
		elevation: {
			raised: 'shadow-lg',
			flat: 'border-border border shadow-sm',
			soft: 'shadow-card',
		},
		surface: {
			default: 'bg-background',
			gradient: 'bg-donation-modal-gradient',
		},
		interactive: {
			true: 'hover:shadow-xl motion-safe:hover:-translate-y-1 motion-reduce:transition-none',
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

type CardProps = WithoutClassName<React.HTMLAttributes<HTMLDivElement>> &
	VariantProps<typeof cardVariants> & {
		/** Shown on a tinted strip below the card, e.g. payment logos or a certification */
		footer?: React.ReactNode;
	};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ padding, elevation, surface, interactive, fullHeight, footer, ...props }, ref) => {
		const card = (
			<div ref={ref} className={cardVariants({ padding, elevation, surface, interactive, fullHeight })} {...props} />
		);

		if (!footer) {
			return card;
		}

		return (
			<div className="bg-secondary overflow-hidden rounded-3xl">
				{card}
				<div className="text-foreground flex flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4 text-sm font-medium">
					{footer}
				</div>
			</div>
		);
	},
);

Card.displayName = 'Card';

export { Card };
