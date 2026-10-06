'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { type WithoutClassName } from '../../without-class-name';

const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full', {
	variants: {
		size: {
			sm: 'size-7',
			default: 'size-8',
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

const AvatarFallback = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Fallback>,
	WithoutClassName<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>
>((props, ref) => (
	<AvatarPrimitive.Fallback
		ref={ref}
		className="bg-muted text-foreground flex h-full w-full items-center justify-center rounded-full text-sm font-medium"
		{...props}
	/>
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarFallback };
