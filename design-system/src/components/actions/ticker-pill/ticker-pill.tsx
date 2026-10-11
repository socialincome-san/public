'use client';

import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AvatarStack, type AvatarStackPerson } from '../../data-display/avatar-stack/avatar-stack';

type TickerPillProps = {
	items: string[];
	label: string;
	people?: AvatarStackPerson[];
	onClick: () => void;
	expanded?: boolean;
};

const TICKER_INTERVAL_MS = 2800;

export const TickerPill = ({ items, label, people = [], onClick, expanded = false }: TickerPillProps) => {
	const [tick, setTick] = useState(0);
	const [paused, setPaused] = useState(false);
	const activeIndex = tick % items.length;

	useEffect(() => {
		if (paused || items.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}

		const timer = setInterval(() => setTick((value) => value + 1), TICKER_INTERVAL_MS);

		return () => clearInterval(timer);
	}, [paused, items.length]);

	return (
		<button
			type="button"
			onClick={onClick}
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocus={() => setPaused(true)}
			onBlur={() => setPaused(false)}
			aria-label={label}
			aria-haspopup="dialog"
			aria-expanded={expanded}
			className="group focus-visible:ring-ring block shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
		>
			{/* The lift sits on the inner pill: moving the button itself would slide its hit area away from the cursor */}
			<span className="bg-card text-foreground inline-flex items-center gap-2 rounded-full py-1 pr-1 pl-4 text-xs shadow-md transition-[translate,box-shadow] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:shadow-lg motion-reduce:transition-none">
				<span aria-hidden="true" className="block h-4 overflow-hidden text-left">
					<span
						className="block transition-[translate] duration-500 ease-out motion-reduce:transition-none"
						style={{ translate: `0 ${-activeIndex}rem` }}
					>
						{items.map((item) => (
							<span key={item} className="block h-4 leading-4 font-medium whitespace-nowrap">
								{item}
							</span>
						))}
					</span>
				</span>
				{people.length > 0 ? <AvatarStack people={people} size="xs" /> : null}
				<span className="bg-accent text-accent-foreground flex size-6 shrink-0 items-center justify-center rounded-full">
					<ChevronRight
						className="size-3.5 transition-[translate] duration-300 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
						aria-hidden="true"
					/>
				</span>
			</span>
		</button>
	);
};
