'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowLeft, X } from 'lucide-react';
import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '../../../cn';
import { type WithoutClassName } from '../../../without-class-name';

const DRAWER_QUERY = '(width < 40rem)';

const subscribeToDrawerQuery = (onChange: () => void) => {
	const query = window.matchMedia(DRAWER_QUERY);
	query.addEventListener('change', onChange);

	return () => query.removeEventListener('change', onChange);
};

const DialogModeContext = React.createContext({ isDrawer: false, dismissible: true });

type DialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Turn off while work is in flight: no close button, outside click, Escape or swipe. */
	dismissible?: boolean;
	/** Turn off for content with its own drag gestures, which would fight the drawer's swipe to close. */
	drawerOnMobile?: boolean;
	children: React.ReactNode;
};

/** A centered dialog on desktop and a bottom drawer that swipes to close on mobile. */
const Dialog = ({ open, onOpenChange, dismissible = true, drawerOnMobile = true, children }: DialogProps) => {
	const matchesDrawerQuery = React.useSyncExternalStore(
		subscribeToDrawerQuery,
		() => window.matchMedia(DRAWER_QUERY).matches,
		() => null,
	);
	const matchesDrawer = drawerOnMobile ? matchesDrawerQuery : false;
	// Switching primitives while open remounts the content and loses its state, e.g. a form when a phone rotates
	const [openedAsDrawer, setOpenedAsDrawer] = React.useState<boolean | null>(null);
	// Wait for the client value, so a dialog open during hydration does not lock in the server guess
	if (open && openedAsDrawer === null && matchesDrawer !== null) {
		setOpenedAsDrawer(matchesDrawer);
	}
	if (!open && openedAsDrawer !== null) {
		setOpenedAsDrawer(null);
	}
	const isDrawer = openedAsDrawer ?? matchesDrawer ?? false;

	return (
		<DialogModeContext value={{ isDrawer, dismissible }}>
			{isDrawer ? (
				<DrawerPrimitive.Root open={open} onOpenChange={onOpenChange} dismissible={dismissible} autoFocus>
					{children}
				</DrawerPrimitive.Root>
			) : (
				<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
					{children}
				</DialogPrimitive.Root>
			)}
		</DialogModeContext>
	);
};

// z-[110] keeps dialogs above the navigation (including the mobile menu overlay at z-100)
const overlayClassName = 'bg-foreground/80 fixed inset-0 z-[110]';

const dialogFrameVariants = cva(
	'text-primary data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-[110] flex max-h-[90dvh] w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] flex-col overflow-y-auto overscroll-contain rounded-3xl duration-200',
	{
		variants: {
			size: {
				sm: 'max-w-md',
				md: 'max-w-2xl',
				lg: 'max-w-4xl',
				xl: 'max-w-7xl',
			},
			height: {
				auto: '',
				fixed: 'h-[min(46rem,90dvh)]',
				full: 'h-[90dvh]',
			},
		},
	},
);

const drawerFrameVariants = cva(
	'text-primary fixed inset-x-0 bottom-0 z-[110] flex max-h-[90dvh] flex-col rounded-t-3xl pb-[env(safe-area-inset-bottom)] focus:outline-none',
	{
		variants: {
			height: {
				auto: '',
				fixed: 'h-[90dvh]',
				full: 'h-[90dvh]',
			},
		},
	},
);

const surfaceVariants = cva('', {
	variants: {
		surface: {
			default: 'bg-background border',
			gradient: 'bg-donation-modal-gradient border-0 shadow-lg',
		},
	},
});

// Header, body and footer use --dialog-px to bleed to the edges
const paddingVariants = cva('', {
	variants: {
		padding: {
			default: 'gap-4 px-(--dialog-px) py-6 [--dialog-px:--spacing(6)]',
			vertical: 'gap-4 py-6 [--dialog-px:0px]',
			none: 'gap-0 p-0 [--dialog-px:0px]',
		},
	},
});

const roundButtonClassName =
	'border-input/60 bg-background text-foreground hover:bg-muted focus-visible:ring-ring grid size-10 shrink-0 place-items-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:outline-hidden [&_svg]:size-5';

const closeButtonPositionClassName = 'absolute top-4 right-4 sm:top-6 sm:right-6';

type DialogContentProps = WithoutClassName<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>> & {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	surface?: 'default' | 'gradient';
	padding?: 'default' | 'vertical' | 'none';
	height?: 'auto' | 'fixed' | 'full';
	/** For confirmations whose footer already offers a way out. */
	hideCloseButton?: boolean;
	closeLabel?: string;
	/** Shows a back button in a toolbar above the content, for dialogs with steps. */
	onBack?: () => void;
	backLabel?: string;
	/** Centered between the back and close buttons, e.g. a segmented toggle. Also turns on the toolbar. */
	toolbar?: React.ReactNode;
};

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
	(
		{
			children,
			size = 'sm',
			surface = 'default',
			padding = 'default',
			height = 'auto',
			hideCloseButton = false,
			closeLabel = 'Close',
			onBack,
			backLabel = 'Back',
			toolbar,
			onInteractOutside,
			onEscapeKeyDown,
			onOpenAutoFocus,
			...props
		},
		ref,
	) => {
		const { isDrawer, dismissible } = React.use(DialogModeContext);
		const showClose = dismissible && !hideCloseButton;
		const hasToolbar = onBack !== undefined || toolbar !== undefined;
		const close = (
			<DialogPrimitive.Close className={roundButtonClassName}>
				<X aria-hidden />
				<span className="sr-only">{closeLabel}</span>
			</DialogPrimitive.Close>
		);
		const closeButton = showClose && !hasToolbar && <div className={closeButtonPositionClassName}>{close}</div>;
		const toolbarRow = hasToolbar && (
			<div className="-mx-(--dialog-px) grid shrink-0 grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 px-4 pt-4 sm:px-6 sm:pt-6">
				{onBack ? (
					<button type="button" onClick={onBack} className={roundButtonClassName} data-testid="dialog-back">
						<ArrowLeft aria-hidden />
						<span className="sr-only">{backLabel}</span>
					</button>
				) : (
					<span />
				)}
				<div className="flex min-w-0 justify-center">{toolbar}</div>
				{showClose ? close : <span />}
			</div>
		);

		if (isDrawer) {
			return (
				<DrawerPrimitive.Portal>
					<DrawerPrimitive.Overlay className={overlayClassName} />
					<DrawerPrimitive.Content
						ref={ref}
						className={cn(drawerFrameVariants({ height }), surfaceVariants({ surface }))}
						onInteractOutside={onInteractOutside}
						onEscapeKeyDown={onEscapeKeyDown}
						onOpenAutoFocus={(event) => {
							onOpenAutoFocus?.(event);
							// Focusing the first field would open the keyboard over the drawer, so focus the drawer itself
							if (!event.defaultPrevented && event.currentTarget instanceof HTMLElement) {
								event.preventDefault();
								event.currentTarget.focus();
							}
						}}
						{...props}
					>
						{/* Sits on the overlay above the drawer, so it stays visible on any drawer surface */}
						{dismissible && (
							<div aria-hidden className="absolute -top-5 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-white/90" />
						)}
						{toolbarRow}
						{/* The drawer itself blocks touch scrolling for its swipe gesture, so the content scrolls in here */}
						<div
							className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain', paddingVariants({ padding }))}
						>
							{children}
						</div>
						{closeButton}
					</DrawerPrimitive.Content>
				</DrawerPrimitive.Portal>
			);
		}

		return (
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay
					className={cn(
						overlayClassName,
						'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
					)}
				/>
				<DialogPrimitive.Content
					ref={ref}
					className={cn(dialogFrameVariants({ size, height }), surfaceVariants({ surface }), paddingVariants({ padding }))}
					onInteractOutside={(event) => {
						if (!dismissible) {
							event.preventDefault();
						}
						onInteractOutside?.(event);
					}}
					onEscapeKeyDown={(event) => {
						if (!dismissible) {
							event.preventDefault();
						}
						onEscapeKeyDown?.(event);
					}}
					onOpenAutoFocus={onOpenAutoFocus}
					{...props}
				>
					{toolbarRow}
					{children}
					{closeButton}
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		);
	},
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

type DialogSectionProps = WithoutClassName<React.HTMLAttributes<HTMLDivElement>> & {
	/** Draws a divider between this section and the dialog body. Turn off for compact dialogs such as confirmations. */
	divided?: boolean;
};

const DialogHeader = ({ divided = true, ...props }: DialogSectionProps) => (
	<div
		className={cn('-mx-(--dialog-px) flex shrink-0 flex-col gap-1.5 px-6 pr-16 text-left', divided && 'border-b pb-6')}
		{...props}
	/>
);
DialogHeader.displayName = 'DialogHeader';

const DialogBody = (props: WithoutClassName<React.HTMLAttributes<HTMLDivElement>>) => (
	<div className="-mx-(--dialog-px) flex min-h-0 flex-1 flex-col overflow-y-auto px-6" {...props} />
);
DialogBody.displayName = 'DialogBody';

const DialogFooter = ({ divided = true, ...props }: DialogSectionProps) => (
	<div
		className={cn(
			'-mx-(--dialog-px) flex shrink-0 flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end',
			divided && 'border-t pt-6',
		)}
		{...props}
	/>
);
DialogFooter.displayName = 'DialogFooter';

const dialogTitleVariants = cva('text-primary leading-snug font-medium tracking-tight text-balance focus:outline-none', {
	variants: {
		size: {
			default: 'text-xl',
			lg: 'text-xl sm:text-2xl',
			xl: 'text-2xl',
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
