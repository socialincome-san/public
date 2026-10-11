import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../../cn';
import { type WithoutClassName } from '../../../without-class-name';

const badgeVariants = cva(
	// Badges wrapped in a link react to hovering the link
	'inline-flex items-center gap-1.5 rounded-full border text-xs transition-opacity [a:hover>&]:opacity-80',
	{
		variants: {
			variant: {
				default: 'bg-muted border-border text-foreground',
				secondary: 'bg-warning-foreground border-warning/30 text-foreground',
				outline: 'bg-accent border-accent text-accent-foreground',
				'outline-solid': 'border-foreground text-foreground bg-transparent',
				destructive: 'bg-destructive-foreground border-destructive/30 text-destructive',
				verified: 'bg-confirm-foreground border-confirm/30 text-confirm',
				country: 'bg-background border-border text-foreground',
				fundraising:
					'bg-confirm-foreground border-confirm/30 text-foreground text-sm leading-none font-medium whitespace-nowrap',
				video: 'bg-black/60 border-white/40 text-white backdrop-blur-sm',
				frosted: 'bg-white/80 border-white/40 text-foreground whitespace-nowrap backdrop-blur-sm',
			},
			size: {
				sm: 'gap-0.5 px-2 py-0.5 text-2xs',
				default: 'px-1.5 py-1',
				lg: 'px-3 py-1.5 font-medium',
			},
		},
		compoundVariants: [
			{
				variant: 'fundraising',
				size: 'default',
				className: 'px-2',
			},
		],
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

type BadgeProps = WithoutClassName<React.HTMLAttributes<HTMLDivElement>> & VariantProps<typeof badgeVariants>;

const Badge = ({ variant, size, ...props }: BadgeProps) => {
	// cn so variant and compound classes override conflicting base classes
	return <div className={cn(badgeVariants({ variant, size }))} {...props} />;
};

export { Badge, badgeVariants };
