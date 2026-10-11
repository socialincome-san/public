'use client';

import { X } from 'lucide-react';
import { Children, createContext, use, useEffect, useEffectEvent, useRef, type ReactNode } from 'react';
import { cn } from '../../../cn';

type BackstageProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	panel: ReactNode;
	panelLabel: string;
	closeLabel: string;
	children: ReactNode;
};

const SLIDE =
	'transition-[translate] duration-600 ease-in-out group-data-[state=open]/backstage:-translate-x-(--backstage-width) group-data-[state=open]/backstage:duration-650 group-data-[state=open]/backstage:ease-glide motion-reduce:transition-none';
const FRAME =
	'transition-[translate,scale] duration-500 ease-glide group-data-[state=open]/backstage:duration-480 motion-reduce:transition-none';
const FADE =
	'opacity-0 transition-opacity duration-350 ease-in-out group-data-[state=open]/backstage:opacity-100 group-data-[state=open]/backstage:duration-520 group-data-[state=open]/backstage:ease-out motion-reduce:transition-none';

const BackstageOpenContext = createContext(false);

// The panel is a sibling of the page, never inside it: a translated ancestor would carry the fixed panel along
export const Backstage = ({ open, onOpenChange, panel, panelLabel, closeLabel, children }: BackstageProps) => {
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const close = useEffectEvent(() => onOpenChange(false));

	useEffect(() => {
		if (!open) {
			return;
		}

		const previouslyFocused = document.activeElement;
		const root = document.documentElement;
		const previousOverflow = root.style.overflow;
		// Radix overlays inside the panel prevent default when Escape dismisses them
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && !event.defaultPrevented) {
				close();
			}
		};

		closeButtonRef.current?.focus({ preventScroll: true });
		root.style.overflow = 'hidden';
		document.addEventListener('keydown', onKeyDown);

		return () => {
			root.style.overflow = previousOverflow;
			document.removeEventListener('keydown', onKeyDown);
			if (previouslyFocused instanceof HTMLElement) {
				previouslyFocused.focus({ preventScroll: true });
			}
		};
	}, [open]);

	return (
		<BackstageOpenContext value={open}>
			<div data-state={open ? 'open' : 'closed'} className="group/backstage [--backstage-width:min(30rem,85vw)]">
				<div
					role="dialog"
					aria-modal="true"
					aria-label={panelLabel}
					// Some tools, like Playwright's role queries, ignore inert, so the closed panel would still count as a dialog
					aria-hidden={!open}
					inert={!open}
					className="bg-backstage text-primary fixed inset-y-0 right-0 z-0 w-(--backstage-width) overflow-y-auto overscroll-contain antialiased"
				>
					<div className="flex min-h-full flex-col gap-8 py-8 pr-6 pl-12">
						<div className="sticky top-8 z-10 -mb-4 self-end">
							<button
								ref={closeButtonRef}
								type="button"
								onClick={() => onOpenChange(false)}
								aria-label={closeLabel}
								className="bg-backstage border-card text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-full border p-3 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
							>
								<X className="size-6" aria-hidden="true" />
							</button>
						</div>
						{panel}
					</div>
				</div>

				<div inert={open} className={cn('bg-background relative z-10', SLIDE)}>
					{children}
				</div>

				<div
					aria-hidden="true"
					onClick={() => onOpenChange(false)}
					className={cn(
						'pointer-events-none fixed inset-y-0 -right-px left-0 z-20 cursor-pointer group-data-[state=open]/backstage:pointer-events-auto',
						SLIDE,
					)}
				>
					<div className={cn('bg-foreground/30 absolute inset-0', FADE)} />
					<div className="absolute inset-0 flex flex-col justify-between">
						<div
							className={cn(
								'flex -translate-y-full flex-col items-end group-data-[state=open]/backstage:translate-y-0',
								FRAME,
							)}
						>
							<div className="bg-backstage h-6 w-full" />
							<div
								className={cn(
									'size-8 origin-top-right scale-0 bg-[radial-gradient(circle_farthest-side_at_0_100%,transparent_99%,var(--color-backstage))] group-data-[state=open]/backstage:scale-100',
									FRAME,
								)}
							/>
						</div>
						<div
							className={cn(
								'flex translate-y-full flex-col items-end group-data-[state=open]/backstage:translate-y-0',
								FRAME,
							)}
						>
							<div
								className={cn(
									'size-8 origin-bottom-right scale-0 bg-[radial-gradient(circle_farthest-side_at_0_0,transparent_99%,var(--color-backstage))] group-data-[state=open]/backstage:scale-100',
									FRAME,
								)}
							/>
							<div className="bg-backstage h-6 w-full" />
						</div>
					</div>
					{/* Paints only outside its box, so the shadow falls on the frame and the panel, not on the page */}
					<div className={cn('shadow-backstage absolute inset-x-0 inset-y-6 rounded-4xl', FADE)} />
				</div>
			</div>
		</BackstageOpenContext>
	);
};

const REVEAL_START_MS = 330;
const REVEAL_STAGGER_MS = 60;

type BackstagePanelProps = {
	children: ReactNode;
};

export const BackstagePanel = ({ children }: BackstagePanelProps) => {
	const open = use(BackstageOpenContext);

	return Children.toArray(children).map((child, index) => (
		<div
			key={index}
			style={{ transitionDelay: open ? `${REVEAL_START_MS + index * REVEAL_STAGGER_MS}ms` : '0ms' }}
			className="translate-x-8 opacity-0 transition-[opacity,translate] duration-250 ease-out group-data-[state=open]/backstage:translate-x-0 group-data-[state=open]/backstage:opacity-100 group-data-[state=open]/backstage:duration-600 motion-reduce:transition-none"
		>
			{child}
		</div>
	));
};
