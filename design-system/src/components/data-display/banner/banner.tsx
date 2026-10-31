'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDownIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../../cn';

// The translucent variants let the page gradient through at 70%: the darkest alpha that keeps text contrast
// above 4.5:1 on the dark variant, and the lightest that keeps the tints visible on the wash.
const bannerVariants = cva('relative flex items-start gap-4 rounded-2xl px-6 py-5', {
	variants: {
		variant: {
			primary: 'bg-primary/70 text-primary-foreground',
			tint: 'bg-banner-blue/70 text-foreground',
			outline: 'bg-background/70 border-border text-foreground border',
			gradient: 'bg-donation-modal-gradient text-foreground',
			highlight: 'bg-highlight text-foreground',
		},
		size: {
			default: 'text-lg md:text-xl',
			sm: 'text-base md:text-lg',
		},
	},
	defaultVariants: {
		variant: 'outline',
		size: 'default',
	},
});

type BannerProps = VariantProps<typeof bannerVariants> & {
	children: ReactNode;
	// Collapses to its first line; the labels name the chevron for screen readers
	collapsible?: { expandLabel: string; collapseLabel: string; defaultCollapsed?: boolean };
};

export const Banner = ({ variant, size, collapsible, children }: BannerProps) => {
	const [expanded, setExpanded] = useState(!collapsible?.defaultCollapsed);
	const contentId = useId();
	const collapsed = collapsible !== undefined && !expanded;
	const contentRef = useRef<HTMLDivElement>(null);

	// Later blocks are display: none and so unfocusable, but links clamped away inside the first block keep their
	// layout below the visible line. Only those leave the tab order; links on the visible line stay reachable.
	useEffect(() => {
		const firstBlock = contentRef.current?.firstElementChild;
		if (!collapsed || !firstBlock) {
			return;
		}
		const links = [...firstBlock.querySelectorAll('a')];
		const updateClippedLinks = () => {
			const visibleBottom = firstBlock.getBoundingClientRect().bottom;
			for (const link of links) {
				if (link.getBoundingClientRect().top >= visibleBottom) {
					link.setAttribute('tabindex', '-1');
				} else {
					link.removeAttribute('tabindex');
				}
			}
		};
		updateClippedLinks();
		const observer = new ResizeObserver(updateClippedLinks);
		observer.observe(firstBlock);

		return () => {
			observer.disconnect();
			links.forEach((link) => link.removeAttribute('tabindex'));
		};
	}, [collapsed]);

	return (
		<div className={bannerVariants({ variant, size })}>
			{/* Clamping only the first block keeps the ellipsis for a first line that wraps: clamping the whole content
			    adds one whenever later blocks are cut. Links lift above the stretched toggle to stay clickable. */}
			<div
				ref={contentRef}
				id={contentId}
				className={cn(
					'min-w-0 flex-1',
					collapsed && '*:not-first:hidden *:first:my-0 *:first:line-clamp-1 [&_a]:relative [&_a]:z-10',
				)}
			>
				{children}
			</div>
			{collapsible ? (
				<button
					type="button"
					aria-expanded={expanded}
					aria-controls={contentId}
					aria-label={expanded ? collapsible.collapseLabel : collapsible.expandLabel}
					onClick={() => setExpanded((current) => !current)}
					className={cn(
						'focus-visible:ring-ring/50 shrink-0 cursor-pointer rounded-md outline-hidden focus-visible:ring-[3px]',
						// While collapsed the whole banner is the click target
						collapsed && 'after:absolute after:inset-0 after:rounded-2xl',
					)}
				>
					<ChevronDownIcon
						className={cn(
							'size-5 translate-y-1 opacity-70 transition-transform duration-200 motion-reduce:transition-none',
							expanded && 'rotate-180',
						)}
					/>
				</button>
			) : null}
		</div>
	);
};
