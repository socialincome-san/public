'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { type WithoutClassName } from '../../../without-class-name';

const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full', {
	variants: {
		size: {
			xs: 'size-6 text-2xs',
			sm: 'size-7 text-sm',
			default: 'size-8 text-sm',
			lg: 'size-9 text-sm',
			xl: 'size-11 text-base',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

const Avatar = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Root>,
	WithoutClassName<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>> & VariantProps<typeof avatarVariants>
>(({ size, ...props }, ref) => <AvatarPrimitive.Root ref={ref} className={avatarVariants({ size })} {...props} />);
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Image>,
	WithoutClassName<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>>
>((props, ref) => <AvatarPrimitive.Image ref={ref} className="aspect-square size-full object-cover" {...props} />);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const avatarFallbackVariants = cva('bg-muted flex h-full w-full items-center justify-center rounded-full font-medium', {
	variants: {
		tone: {
			default: 'text-foreground',
			muted: 'text-muted-foreground',
		},
	},
	defaultVariants: {
		tone: 'default',
	},
});

const AvatarFallback = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Fallback>,
	WithoutClassName<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>> &
		VariantProps<typeof avatarFallbackVariants>
>(({ tone, ...props }, ref) => (
	<AvatarPrimitive.Fallback ref={ref} className={avatarFallbackVariants({ tone })} {...props} />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarFallback, AvatarImage };
