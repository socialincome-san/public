import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils';

const badgeVariants = cva(
	'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	{
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary-muted',
				secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary-muted',
				destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive-muted',
				muted: 'border-muted-foreground text-muted-foreground hover:bg-muted-foreground hover:text-muted',
				accent: 'border-transparent bg-accent text-accent-foreground hover:bg-muted-foreground hover:text-muted',
				outline:
					'text-primary border-primary hover:bg-primary-muted hover:text-primary-foreground hover:border-primary-muted',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
