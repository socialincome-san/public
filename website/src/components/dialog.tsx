'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils/cn';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80',
			className,
		)}
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const mobileFullscreenClasses =
	'max-sm:inset-0 max-sm:h-dvh max-sm:min-h-dvh max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=closed]:zoom-out-100';

const dialogCloseButtonClassName =
	'ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden focus-visible:ring-[3px] disabled:pointer-events-none sm:top-6 sm:right-6';

const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
		variant?: 'default' | 'large';
		hasGradient?: boolean;
		overlayClassName?: string;
		closeOnClickOutside?: boolean;
		closeOnEscape?: boolean;
		hideCloseButton?: boolean;
		onCloseClick?: () => void;
	}
>(
	(
		{
			className,
			children,
			variant = 'default',
			hasGradient = false,
			overlayClassName,
			closeOnClickOutside = true,
			closeOnEscape = true,
			hideCloseButton = false,
			onCloseClick,
			onInteractOutside,
			onEscapeKeyDown,
			...props
		},
		ref,
	) => {
		const sizeClasses = variant === 'large' ? 'w-[80vw] max-w-none sm:max-w-none' : 'w-full max-w-lg sm:max-w-[425px]';
		const surfaceClasses = hasGradient
			? 'bg-donation-modal-gradient rounded-3xl border-0 shadow-lg'
			: 'bg-background rounded-lg border';

		return (
			<DialogPortal>
				<DialogOverlay className={overlayClassName} />
				<DialogPrimitive.Content
					ref={ref}
					className={cn(
						'max-w-site-width data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-4 p-6 duration-200',
						surfaceClasses,
						sizeClasses,
						mobileFullscreenClasses,
						className,
					)}
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
							<button type="button" className={dialogCloseButtonClassName} aria-label="Close" onClick={onCloseClick}>
								<X className="h-6 w-6" aria-hidden />
							</button>
						) : (
							<DialogPrimitive.Close className={dialogCloseButtonClassName}>
								<X className="h-6 w-6" aria-hidden />
								<span className="sr-only">Close</span>
							</DialogPrimitive.Close>
						))}
				</DialogPrimitive.Content>
			</DialogPortal>
		);
	},
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'-mx-6 flex flex-row items-center justify-between space-y-1.5 border-b p-6 pt-0 text-center sm:text-left',
			className,
		)}
		{...props}
	/>
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'-mx-6 flex flex-col-reverse items-center justify-end gap-2 border-t p-6 pb-0 sm:flex-row sm:justify-end sm:space-x-2',
			className,
		)}
		{...props}
	/>
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn('text-foreground text-xl leading-none font-medium tracking-tight', className)}
		{...props}
	/>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger };
