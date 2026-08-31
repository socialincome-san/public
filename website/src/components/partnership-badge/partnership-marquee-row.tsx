'use client';

import { PartnershipBadge } from '@/components/partnership-badge/partnership-badge';
import type { Partnership } from '@/generated/storyblok/types/109655/storyblok-components';
import { useEffect, useRef, useState } from 'react';

type Props = {
	entries: Partnership[];
	reverse?: boolean;
};

const PIXELS_PER_SECOND = 2500;

export const PartnershipMarqueeRow = ({ entries, reverse = false }: Props) => {
	const trackRef = useRef<HTMLDivElement>(null);
	const [duration, setDuration] = useState<number>();
	useEffect(() => {
		const track = trackRef.current;

		if (!track) {
			return;
		}

		const calculateDuration = () => {
			const rowWidth = track.scrollWidth / 2;
			setDuration(rowWidth / PIXELS_PER_SECOND);
		};

		calculateDuration();

		const resizeObserver = new ResizeObserver(calculateDuration);
		resizeObserver.observe(track);
		return () => resizeObserver.disconnect();
	}, [entries]);

	return (
		<div className="overflow-hidden py-2">
			<div
				ref={trackRef}
				className={`partnerships-marquee flex w-max ${reverse ? 'partnerships-marquee-reverse' : ''}`}
				style={duration ? { animationDuration: `${duration}s` } : undefined}
			>
				{[0, 1].map((copy) => (
					<div
						key={copy}
						aria-hidden={copy === 1}
						inert={copy === 1 ? true : undefined}
						className="flex shrink-0 gap-3 pr-3"
					>
						{entries.map((entry) => (
							<PartnershipBadge key={`${copy}-${entry._uid}`} partnership={entry} />
						))}
					</div>
				))}
			</div>
		</div>
	);
};
