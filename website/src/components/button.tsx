import { Slot } from '@radix-ui/react-slot';
import { cn } from '@socialincome/ui/src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 z-10',
	{
		variants: {
			variant: {
				default: [
					'text-primary-foreground shadow-sm bg-primary/90 relative',
					// Use a pseudo element to allow the gradient transition effect
					'after:bg-linear-to-r after:from-[hsl(var(--gradient-button-from))] after:to-[hsl(var(--gradient-button-to))] after:inset-0 after:-z-10 after:rounded-full after:absolute after:opacity-100 hover:after:opacity-0 focus:after:opacity-0 after:transition-opacity',
				].join(' '),
				destructive: 'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
				outline: 'border border-input hover:bg-accent hover:text-accent-foreground bg-background/5 ',
				secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
				confirmed:
					'bg-[hsl(var(--confirm))] text-[hsl(var(--confirm-foreground))] shadow-xs hover:bg-[hsl(var(--confirm)/0.9)]',
			},
			size: {
				default: 'h-9 px-4 py-2',
				sm: 'h-8 rounded-full px-3 text-xs',
				lg: 'h-10 rounded-full px-8',
				icon: 'h-9 w-9',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';
		return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
	},
);
Button.displayName = 'Button';

export { Button, buttonVariants };
