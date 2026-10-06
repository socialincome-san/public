'use client';

import type { TeaserAvatar } from '@/components/behind-the-scenes/behind-the-scenes-data';
import { useBehindTheScenes } from '@/components/behind-the-scenes/use-behind-the-scenes';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const AVATAR_SIZE = 24;
const AVATAR_STAGGER_MS = 90;
const TICKER_INTERVAL_MS = 2800;
// Each line is exactly one row tall, so the track shifts by this much per step (h-4 / leading-4).
const TICKER_LINE_HEIGHT_PX = 16;

type Props = {
	tickerItems: string[];
	ariaLabel: string;
	avatars: TeaserAvatar[];
};

/**
 * The entry point to the community panel: a rotating claim, the faces behind it, and a filled arrow.
 *
 * The arrow is a solid disc rather than a bare glyph on purpose — it has to read as "this opens
 * something" on touch devices too, where the hover lift never fires. Hover only enhances.
 *
 * The ticker track holds every line stacked vertically, so the pill's width settles on the widest
 * line and never reflows as it cycles. Honours prefers-reduced-motion by holding on the first line.
 */
export const BehindTheScenesTeaser = ({ tickerItems, ariaLabel, avatars }: Props) => {
	const { isOpen, toggle, panelId } = useBehindTheScenes();
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		if (tickerItems.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}

		const timer = setInterval(() => {
			setActiveIndex((index) => (index + 1) % tickerItems.length);
		}, TICKER_INTERVAL_MS);

		return () => clearInterval(timer);
	}, [tickerItems.length]);

	return (
		<button
			type="button"
			onClick={toggle}
			aria-expanded={isOpen}
			aria-controls={panelId}
			aria-label={ariaLabel}
			className="group block shrink-0 rounded-full"
		>
			{/*
			 * The lift lives on this inner pill, never on the button. Translating the button itself moved
			 * its own hit area out from under the cursor near the bottom edge, so hover dropped, the pill
			 * fell back, hover re-fired — a flicker loop. The button box now stays put and only the
			 * visual moves.
			 */}
			<span className="bg-card text-foreground inline-flex items-center gap-2 rounded-full py-1 pr-1 pl-4 text-xs shadow-md transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:shadow-lg">
				<span aria-hidden="true" className="block h-4 overflow-hidden text-left">
					<span
						className="block transition-transform duration-500 ease-out"
						style={{ transform: `translateY(-${activeIndex * TICKER_LINE_HEIGHT_PX}px)` }}
					>
						{tickerItems.map((item) => (
							<span key={item} className="block h-4 leading-4 font-medium whitespace-nowrap">
								{item}
							</span>
						))}
					</span>
				</span>

				{/*
				 * The stack keeps a fixed footprint on hover. Fanning it with margins was animating layout,
				 * which resized the pill and shoved the label and chevron sideways mid-transition; scaling
				 * each avatar instead stays on the compositor and leaves the geometry alone.
				 */}
				<span className="flex -space-x-2">
					{avatars.map((avatar, index) => (
						<span
							key={avatar.src}
							style={{ animationDelay: `${index * AVATAR_STAGGER_MS}ms`, transitionDelay: `${index * 40}ms` }}
							className="animate-in fade-in-0 slide-in-from-right-2 transition-transform duration-300 ease-out group-hover:scale-110"
						>
							<Image
								src={avatar.src}
								alt={avatar.alt}
								width={AVATAR_SIZE}
								height={AVATAR_SIZE}
								className="border-card size-6 rounded-full border-2 object-cover"
							/>
						</span>
					))}
				</span>

				<span className="bg-accent text-accent-foreground flex size-6 shrink-0 items-center justify-center rounded-full">
					<ChevronRight
						className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
						aria-hidden="true"
					/>
				</span>
			</span>
		</button>
	);
};
