import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { ComponentType } from 'react';
import { cn } from '../lib/utils';
import { SpinnerIcon } from '../logos/spinner-icon';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-full text-sm ring-offset-background transition-all duration-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			size: {
				default: 'h-10 px-6 py-2',
				sm: 'h-9 px-4',
				lg: 'h-16 px-10 text-lg',
				icon: 'h-10 w-10',
			},
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary-muted font-medium',
				destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive-muted font-medium',
				outline: 'border border-primary bg-background hover:bg-muted font-medium',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-muted font-medium',
				ghost: 'font-normal',
				link: 'text-foreground underline-offset-4 hover:underline p-0 font-normal',
			},
		},
		defaultVariants: {
			size: 'default',
			variant: 'default',
		},
	},
);

const iconVariants = cva('', {
	variants: {
		size: {
			default: 'h-4 w-4 mr-2',
			sm: 'h-3 w-3 mr-2',
			lg: 'h-6 w-6 mr-3',
			icon: 'h-6 w-6',
		},
		defaultVariants: {
			size: 'default',
		},
	},
});

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	showLoadingSpinner?: boolean;
	Icon?: ComponentType<any>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant = 'default',
			size = 'default',
			asChild = false,
			Icon,
			showLoadingSpinner = false,
			children,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : 'button';
		Icon = showLoadingSpinner ? SpinnerIcon : Icon;
		return (
			<Comp className={cn(buttonVariants({ size, variant, className }))} ref={ref} {...props}>
				{Icon ? (
					<div className={cn('flex w-full items-center justify-center')}>
						<Icon className={cn(iconVariants({ size }))} />
						{children}
					</div>
				) : (
					<>{children}</>
				)}
			</Comp>
		);
	},
);
Button.displayName = 'Button';

export { Button, buttonVariants };
