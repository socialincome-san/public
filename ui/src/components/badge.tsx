import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils';

const badgeVariants = cva(
	'inline-flex items-center rounded-full border transition-colors focus:outline-none font-semibold',
	{
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground',
				faded: 'border-transparent bg-primary bg-opacity-10 text-primary',
				secondary: 'border-transparent bg-secondary text-secondary-foreground',
				destructive: 'border-transparent bg-destructive text-destructive-foreground',
				muted: 'border-muted-foreground text-muted-foreground',
				accent: 'border-transparent bg-accent text-accent-foreground',
				outline: 'text-primary border-primary bg-white',
				white: 'border-white bg-transparent text-white',
				interactive:
					'border-transparent bg-primary bg-opacity-10 text-primary hover:bg-opacity-100 hover:text-white focus:ring-2 focus:ring-ring focus:ring-offset-2',
				'interactive-accent':
					'border-transparent bg-accent bg-opacity-50 text-primary hover:bg-opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2',
				'interactive-secondary':
					'border-transparent bg-secondary bg-opacity-10 text-secondary hover:bg-opacity-100 hover:text-white focus:ring-2 focus:ring-ring focus:ring-offset-2',
				'interactive-destructive':
					'border-transparent bg-destructive bg-opacity-10 text-destructive hover:bg-opacity-100 hover:text-white focus:ring-2 focus:ring-ring focus:ring-offset-2',
				'interactive-muted':
					'border-muted-foreground text-muted-foreground hover:bg-muted-foreground hover:text-muted focus:ring-2 focus:ring-ring focus:ring-offset-2',
				'interactive-outline':
					'border-primary bg-transparent text-primary hover:bg-primary hover:text-white focus:ring-2 focus:ring-ring focus:ring-offset-2',
			},
			size: {
				sm: 'px-2 py-0.5 text-xs',
				md: 'px-2.5 py-1 text-sm',
				lg: 'px-3 py-1.5 text-base',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'sm',
		},
	},
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
	size?: 'sm' | 'md' | 'lg';
}

function Badge({ className, variant, size, ...props }: BadgeProps) {
	return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
