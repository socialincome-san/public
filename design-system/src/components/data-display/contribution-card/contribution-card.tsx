'use client';

import { ArrowUpRight } from 'lucide-react';
import NextLink from 'next/link';
import { type ReactNode, useState } from 'react';
import { cn } from '../../../cn';
import { Button } from '../../actions/button/button';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar/avatar';

const STEP = 6;
const INITIAL_COUNT = STEP;
const INITIAL_COUNT_PHONE = 2;
// Tailwind's `sm` breakpoint
const WIDE_QUERY = '(min-width: 40rem)';

type ContributionCardItem = {
	title: string;
	href: string;
	// Opens in a new tab
	external?: boolean;
	// Small round image before the title, e.g. a flag
	icon?: ReactNode;
	badges?: string[];
};

type ContributionCardProps = {
	// The sentence above the list; `<strong>` is bold, `ContributionCardPerson` shows who it is about
	summary: ReactNode;
	items: ContributionCardItem[];
	// `{count}` is replaced with the number of items the button reveals
	showMoreLabel: string;
	// `{shown}` and `{total}` are replaced with the number of visible items and of all items
	counterLabel: string;
	// Read out after the title of an external item, e.g. "opens in a new tab"
	externalLinkLabel?: string;
};

type ContributionCardPersonProps = {
	name: string;
	// Used for the initials, defaults to the name
	fullName?: string;
	imageSrc?: string | null;
};

const focusWhenAttached = (element: HTMLAnchorElement | null) => element?.focus();

const initialsOf = (name: string) =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join('')
		.toUpperCase();

// Inline in the summary: a small portrait in front of the name
export const ContributionCardPerson = ({ name, fullName = name, imageSrc }: ContributionCardPersonProps) => (
	<span className="whitespace-nowrap">
		<span className="mr-2 inline-flex align-middle" aria-hidden="true">
			<Avatar size="sm">
				{imageSrc ? <AvatarImage src={imageSrc} alt="" /> : null}
				<AvatarFallback>{initialsOf(fullName)}</AvatarFallback>
			</Avatar>
		</span>
		{name}
	</span>
);

export const ContributionCard = ({
	summary,
	items,
	showMoreLabel,
	counterLabel,
	externalLinkLabel,
}: ContributionCardProps) => {
	// Until the first "show more", CSS decides how many of the first items a phone shows, so the server and the
	// browser render the same markup
	const [revealedCount, setRevealedCount] = useState<number | null>(null);
	// The first row of the last step takes the focus, because the button that revealed it is gone
	const [focusIndex, setFocusIndex] = useState<number | null>(null);
	const total = items.length;
	const visibleItems = items.slice(0, revealedCount ?? INITIAL_COUNT);

	const showMore = () => {
		const shown = revealedCount ?? (window.matchMedia(WIDE_QUERY).matches ? INITIAL_COUNT : INITIAL_COUNT_PHONE);
		const next = Math.min(shown + STEP, total);
		setRevealedCount(next);
		if (next >= total) {
			setFocusIndex(shown);
		}
	};

	const isInitial = revealedCount === null;
	const formatShowMore = (shown: number) => showMoreLabel.replace('{count}', String(Math.min(STEP, total - shown)));
	const formatCounter = (shown: number) => counterLabel.replace('{shown}', String(shown)).replace('{total}', String(total));
	const hasMore = total > (revealedCount ?? INITIAL_COUNT_PHONE);

	return (
		<div className="bg-card shadow-card rounded-3xl p-4 sm:p-6">
			<p className="text-foreground text-lg leading-[1.4] sm:text-xl [&_strong]:font-bold">{summary}</p>
			<ul className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-x-12 sm:mt-6">
				{visibleItems.map((item, index) => (
					<li
						key={`${item.href}-${item.title}`}
						className={cn(
							'border-border flex items-center justify-between gap-4 border-t py-2.5 sm:py-3.5',
							isInitial && index >= INITIAL_COUNT_PHONE && 'max-sm:hidden',
						)}
					>
						<span className="flex min-w-0 flex-1 items-center gap-2.5">
							{item.icon ? (
								<span className="flex size-6 shrink-0 overflow-hidden rounded-full" aria-hidden="true">
									{item.icon}
								</span>
							) : null}
							<NextLink
								ref={index === focusIndex ? focusWhenAttached : undefined}
								href={item.href}
								{...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
								className="group text-foreground focus-visible:ring-ring min-w-0 rounded-sm text-base font-medium wrap-anywhere hover:underline focus-visible:ring-2 focus-visible:outline-hidden sm:text-lg"
							>
								{item.title}
								{/* Joined to the last word, so the arrow never wraps onto a line of its own */}
								<span className="whitespace-nowrap">
									{'\u2060'}
									<ArrowUpRight
										className="text-muted-foreground ml-1 inline size-4 align-middle transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
										aria-hidden
									/>
								</span>
								{item.external && externalLinkLabel ? <span className="sr-only">{externalLinkLabel}</span> : null}
							</NextLink>
						</span>
						{item.badges && item.badges.length > 0 ? (
							<span className="flex max-w-[45%] flex-none flex-col items-end gap-1">
								{item.badges.map((badge) => (
									<span key={badge} className="bg-muted text-foreground rounded-full px-2.5 py-0.5 text-right text-xs">
										{badge}
									</span>
								))}
							</span>
						) : null}
					</li>
				))}
			</ul>
			{hasMore ? (
				// One button for both initial layouts, so it keeps the focus when the first click replaces them
				<div className={cn('mt-4 flex items-center gap-4 sm:mt-6', isInitial && total <= INITIAL_COUNT && 'sm:hidden')}>
					<Button type="button" variant="outline" onClick={showMore}>
						{isInitial ? (
							<>
								<span className="sm:hidden">{formatShowMore(INITIAL_COUNT_PHONE)}</span>
								<span className="max-sm:hidden">{formatShowMore(INITIAL_COUNT)}</span>
							</>
						) : (
							formatShowMore(revealedCount)
						)}
					</Button>
					<span className="text-muted-foreground text-sm">
						{isInitial ? (
							<>
								<span className="sm:hidden">{formatCounter(INITIAL_COUNT_PHONE)}</span>
								<span className="max-sm:hidden">{formatCounter(INITIAL_COUNT)}</span>
							</>
						) : (
							formatCounter(revealedCount)
						)}
					</span>
				</div>
			) : null}
		</div>
	);
};
