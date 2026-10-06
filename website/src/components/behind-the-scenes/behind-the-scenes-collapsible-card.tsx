'use client';

import { cn } from '@socialincome/design-system/cn';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

type Props = {
	/** Always-visible row: the faces and names of whoever maintains this page. */
	summary: ReactNode;
	/** Accessible names for the toggle — the control itself is a chevron. */
	showMoreLabel: string;
	showLessLabel: string;
	children: ReactNode;
};

/**
 * Card that keeps the page's maintainers to one row until asked.
 *
 * Collapsed still names them — only the roles and the mistake-report are folded away — so the
 * panel opens with accountability visible rather than hidden behind a disclosure.
 *
 * The expanded content is server-rendered and arrives as children, so nothing about the people
 * has to be serialised into the client bundle.
 */
export const BehindTheScenesCollapsibleCard = ({ summary, showMoreLabel, showLessLabel, children }: Props) => {
	const contentId = useId();
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div className="bg-card flex flex-col rounded-xl shadow-lg">
			{/*
			 * The whole summary row is the control, not just the chevron — a 28px target sitting next to
			 * a full-width card invites misses, especially on touch. The row carries the card's padding
			 * so the hit area reaches the edges. Only the row: the expanded content holds links, which
			 * cannot nest inside a button.
			 *
			 * The names stay the accessible name and the show/hide wording rides along as sr-only text,
			 * so the button announces who it is about rather than only "Show more".
			 */}
			<button
				type="button"
				onClick={() => setIsExpanded((open) => !open)}
				aria-expanded={isExpanded}
				aria-controls={contentId}
				className={cn(
					'ring-offset-background focus-visible:ring-ring group flex w-full items-center justify-between gap-4',
					'rounded-xl px-4 py-3 text-left focus-visible:ring-2 focus-visible:outline-hidden lg:px-6',
				)}
			>
				{summary}
				<span className="text-muted-foreground group-hover:text-foreground shrink-0 rounded-full p-1 transition-colors">
					{isExpanded ? (
						<ChevronUp className="size-5" aria-hidden="true" />
					) : (
						<ChevronDown className="size-5" aria-hidden="true" />
					)}
					<span className="sr-only">{isExpanded ? showLessLabel : showMoreLabel}</span>
				</span>
			</button>
			{isExpanded ? (
				/* mt-1 rather than mt-4: the button's own bottom padding already supplies 12 of the 16px. */
				<div id={contentId} className="mt-1 flex flex-col gap-4 px-4 pb-3 lg:px-6">
					{children}
				</div>
			) : null}
		</div>
	);
};
