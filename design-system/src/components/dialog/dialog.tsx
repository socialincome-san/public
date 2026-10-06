'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../cn';
import { type WithoutClassName } from '../../without-class-name';

const Dialog = DialogPrimitive.Root;

const DialogPortal = DialogPrimitive.Portal;

// z-[110] keeps dialogs above the navigation (including the mobile menu overlay at z-100)
const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	WithoutClassName<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>
>((props, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className="bg-foreground/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[110]"
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogContentVariants = cva(
	'text-primary max-w-site-width data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-[110] flex max-h-[90dvh] w-full translate-x-[-50%] translate-y-[-50%] flex-col overflow-y-auto overscroll-contain duration-200',
	{
		variants: {
			size: {
				// Short confirmations: a bottom sheet on mobile instead of a full-screen dialog
				alert:
					'sm:max-w-[400px] max-sm:inset-x-4 max-sm:top-auto max-sm:bottom-4 max-sm:w-auto max-sm:translate-x-0 max-sm:translate-y-0',
				sm: 'sm:max-w-md',
				md: 'sm:max-w-2xl',
				lg: 'sm:max-w-4xl',
				full: 'sm:w-site-width sm:max-w-none',
			},
			surface: {
				default: 'bg-background rounded-3xl border',
				gradient: 'bg-donation-modal-gradient rounded-3xl border-0 shadow-lg',
			},
			// --dialog-px lets header, body and footer bleed to the edges whatever the padding
			padding: {
				default: 'gap-4 px-(--dialog-px) py-6 [--dialog-px:--spacing(6)]',
				// For content with its own full-width sections that set their own horizontal padding
				vertical: 'gap-4 py-6 [--dialog-px:0px]',
				none: 'gap-0 p-0 [--dialog-px:0px]',
			},
			// Fixed keeps multi-step dialogs from resizing between steps
			height: {
				auto: '',
				fixed: 'sm:h-[min(46rem,90dvh)]',
			},
		},
		compoundVariants: [
			{
				size: ['sm', 'md', 'lg', 'full'],
				className:
					'max-sm:inset-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=closed]:zoom-out-100',
			},
		],
		defaultVariants: {
			size: 'sm',
			surface: 'default',
			padding: 'default',
			height: 'auto',
		},
	},
);

const dialogCloseButtonClassName =
	'ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden focus-visible:ring-[3px] disabled:pointer-events-none sm:top-6 sm:right-6';

const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	WithoutClassName<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>> &
		VariantProps<typeof dialogContentVariants> & {
			closeOnClickOutside?: boolean;
			closeOnEscape?: boolean;
			hideCloseButton?: boolean;
			closeLabel?: string;
			onCloseClick?: () => void;
		}
>(
	(
		{
			children,
			size,
			surface,
			padding,
			height,
			closeOnClickOutside = true,
			closeOnEscape = true,
			hideCloseButton = false,
			closeLabel = 'Close',
			onCloseClick,
			onInteractOutside,
			onEscapeKeyDown,
			...props
		},
		ref,
	) => (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				ref={ref}
				className={dialogContentVariants({ size, surface, padding, height })}
				onInteractOutside={(event) => {
					if (!closeOnClickOutside) {
						event.preventDefault();
					}
					onInteractOutside?.(event);
				}}
				onEscapeKeyDown={(event) => {
					if (!closeOnEscape) {
						event.preventDefault();
					}
					onEscapeKeyDown?.(event);
				}}
				{...props}
			>
				{children}
				{!hideCloseButton &&
					(onCloseClick ? (
						<button type="button" className={dialogCloseButtonClassName} aria-label={closeLabel} onClick={onCloseClick}>
							<X className="h-6 w-6" aria-hidden />
						</button>
					) : (
						<DialogPrimitive.Close className={dialogCloseButtonClassName}>
							<X className="h-6 w-6" aria-hidden />
							<span className="sr-only">{closeLabel}</span>
						</DialogPrimitive.Close>
					))}
			</DialogPrimitive.Content>
		</DialogPortal>
	),
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

// Header, body and footer span the full dialog width so their dividers reach the edges.
// The header leaves room on the right for the close button.
const DialogHeader = (props: WithoutClassName<React.HTMLAttributes<HTMLDivElement>>) => (
	<div className="-mx-(--dialog-px) flex shrink-0 flex-col gap-1.5 border-b px-6 pr-12 pb-6 text-left" {...props} />
);
DialogHeader.displayName = 'DialogHeader';

// Scrolls on its own so the header and footer stay visible
const DialogBody = (props: WithoutClassName<React.HTMLAttributes<HTMLDivElement>>) => (
	<div className="-mx-(--dialog-px) flex min-h-0 flex-1 flex-col overflow-y-auto px-6" {...props} />
);
DialogBody.displayName = 'DialogBody';

const DialogFooter = (props: WithoutClassName<React.HTMLAttributes<HTMLDivElement>>) => (
	<div
		className="-mx-(--dialog-px) flex shrink-0 flex-col-reverse gap-2 border-t px-6 pt-6 sm:flex-row sm:justify-end"
		{...props}
	/>
);
DialogFooter.displayName = 'DialogFooter';

const dialogTitleVariants = cva('text-primary leading-snug font-medium tracking-tight text-balance focus:outline-none', {
	variants: {
		size: {
			default: 'text-xl',
			lg: 'text-xl sm:text-2xl',
		},
		visuallyHidden: {
			true: 'sr-only',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	WithoutClassName<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>> & VariantProps<typeof dialogTitleVariants>
>(({ size, visuallyHidden, ...props }, ref) => (
	<DialogPrimitive.Title ref={ref} className={dialogTitleVariants({ size, visuallyHidden })} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	WithoutClassName<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>> & { visuallyHidden?: boolean }
>(({ visuallyHidden, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn('text-muted-foreground text-sm', visuallyHidden && 'sr-only')}
		{...props}
	/>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle };
