import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
	'relative inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 z-10',
	{
		variants: {
			variant: {
				default: [
					'text-primary-foreground shadow-sm bg-primary/90',
					// Use a pseudo element to allow the gradient transition effect
					'after:bg-linear-to-r after:from-[hsl(var(--gradient-button-from))] after:to-[hsl(var(--gradient-button-to))] after:inset-0 after:-z-10 after:rounded-full after:absolute after:opacity-100 hover:after:opacity-0 focus:after:opacity-0 after:transition-opacity',
				].join(' '),
				destructive: 'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
				'destructive-outline':
					'border border-destructive/30 bg-card text-destructive hover:bg-destructive-foreground hover:text-destructive',
				outline: 'border border-input text-primary hover:bg-accent hover:text-accent-foreground bg-background',
				// For buttons placed on photos or videos
				'outline-inverse':
					'border border-input text-primary-foreground hover:bg-accent hover:text-accent-foreground bg-background/5',
				overlay: 'text-primary-foreground bg-foreground/45 hover:bg-foreground/60',
				secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
				foreground: 'bg-foreground text-primary-foreground shadow-xs hover:bg-foreground/90',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
				confirmed: 'bg-confirm text-confirm-foreground shadow-xs hover:bg-confirm/90',
			},
			size: {
				// Long labels may wrap on small screens instead of overflowing
				default: 'px-6 py-3 text-center whitespace-normal sm:whitespace-nowrap',
				sm: 'h-8 px-3 text-xs whitespace-nowrap',
				md: 'h-10 px-4 whitespace-nowrap',
				lg: 'h-10 px-8 whitespace-nowrap',
				'icon-sm': 'size-8',
				icon: 'size-9',
				'icon-lg': 'size-10',
				inline: 'p-0 whitespace-nowrap',
			},
			fullWidth: {
				true: 'w-full',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

type ButtonProps = {
	asChild?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> &
	VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ variant, size, fullWidth, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';

		return <Comp className={buttonVariants({ variant, size, fullWidth })} ref={ref} {...props} />;
	},
);
Button.displayName = 'Button';

export { Button, buttonVariants };
