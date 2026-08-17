import { cn } from '@/lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const badgeVariants = cva('inline-flex items-center rounded-full border py-1 px-1.5 text-xs', {
	variants: {
		variant: {
			default: 'bg-muted border-border text-foreground',
			secondary: 'bg-warning-foreground border-warning/30 text-foreground',
			outline: 'bg-accent border-accent text-accent-foreground',
			'outline-solid': 'border-foreground text-foreground bg-transparent',
			destructive: 'bg-destructive-foreground border-destructive/30 text-destructive',
			verified: 'bg-confirm-foreground border-confirm/30 text-confirm',
			country: 'bg-background border-border text-foreground',
			video: 'bg-black/60 border-white/40 text-white backdrop-blur-sm',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

type BadgeProps = {} & React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

export const Badge = ({ className, variant, ...props }: BadgeProps) => {
	return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
};
