import { cn } from '@socialincome/ui/src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const badgeVariants = cva('inline-flex items-center rounded-full border py-1 px-1.5 text-xs', {
	variants: {
		variant: {
			default: 'bg-muted border-border text-slate-700',
			secondary: 'bg-orange-50 border-orange-300 text-orange-700',
			outline: 'bg-sky-50 border-sky-300 text-sky-700',
			destructive: 'bg-rose-50 border-rose-300 text-rose-700',
			verified: 'bg-green-50 border-green-300 text-green-700',
			country: 'bg-background border-border text-foreground',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
	return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
