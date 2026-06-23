import { cn } from '@/lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const badgeVariants = cva('inline-flex items-center rounded-full border py-1 px-1.5 text-xs', {
	variants: {
		variant: {
			default: 'bg-muted border-border text-foreground',
			secondary: 'bg-orange-50 border-orange-300 text-foreground',
			outline: 'bg-sky-50 border-sky-300 text-foreground',
			'outline-solid': 'border-foreground text-foreground bg-transparent',
			destructive: 'bg-rose-50 border-rose-300 text-destructive',
			verified: 'bg-green-50 border-green-300 text-confirm',
			country: 'bg-background border-border text-foreground',
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
