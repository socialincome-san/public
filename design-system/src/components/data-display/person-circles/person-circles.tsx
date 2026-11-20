import NextImage from 'next/image';
import NextLink from 'next/link';
import { type CSSProperties, type ReactNode } from 'react';
import { cn } from '../../../cn';
import {
	getActiveDiscAngles,
	getDiscPosition,
	limitActiveDiscs,
	limitInterestedDiscs,
	PERSON_CIRCLES_GEOMETRY,
} from './person-circles-geometry';
import { PersonCirclesOrbit } from './person-circles-orbit';

const { width, ringRadii, active, interested } = PERSON_CIRCLES_GEOMETRY;

// The discs follow the portrait, one after another
const ENTER_DELAY_MS = 250;
const ENTER_STAGGER_MS = 60;
// No two neighbours drift alike
const DRIFTS = [
	{ x: 2, y: -3, seconds: 7 },
	{ x: -3, y: 2, seconds: 8 },
	{ x: 3, y: 3, seconds: 6 },
	{ x: -2, y: -4, seconds: 7.5 },
];
// The brand gradient of the donate button
const activeTone =
	'bg-linear-135 from-[hsl(var(--gradient-button-from))] to-[hsl(var(--gradient-button-to))] text-primary-foreground';

const toPercent = (units: number) => `${(units / width) * 100}%`;
const toPosition = ({ left, top }: { left: number; top: number }): CSSProperties => ({
	left: `${left}%`,
	top: `${top}%`,
});
// Centered on the portrait, sized by a diameter in portrait radii
const centered = (diameter: number): CSSProperties => ({
	...toPosition(getDiscPosition(0, 0)),
	width: toPercent(diameter),
});

type PersonCirclesItem = {
	label: string;
	href: string;
};

type PersonCirclesProps = {
	image?: { src: string; alt: string } | null;
	// Shown instead of a missing portrait
	initials: string;
	activeCircles?: PersonCirclesItem[];
	interestedCircles?: PersonCirclesItem[];
	// Names the two kinds of discs below the composition, e.g. "Active member" and "Follower"
	legend: { active: string; interested: string };
	// Where the "+N" discs lead, and what they are called for screen readers
	more: { href: string; getLabel: (count: number) => string };
};

type DiscProps = {
	href: string;
	// Its place in the order of appearance
	index: number;
	angle: number;
	distance: number;
	diameter: number;
	tone: string;
	// The font size, which follows the width of the composition
	textSize: string;
	label?: string;
	children: ReactNode;
};

const Disc = ({ href, index, angle, distance, diameter, tone, textSize, label, children }: DiscProps) => {
	const drift = DRIFTS[index % DRIFTS.length];

	return (
		<div
			className={cn('animate-disc-enter absolute aspect-square -translate-1/2 motion-reduce:animate-none', textSize)}
			style={{
				...toPosition(getDiscPosition(angle, distance)),
				width: toPercent(diameter),
				animationDelay: `${ENTER_DELAY_MS + index * ENTER_STAGGER_MS}ms`,
			}}
		>
			<div
				className="animate-disc-drift size-full motion-reduce:animate-none"
				style={
					{
						'--drift-x': `${drift.x}px`,
						'--drift-y': `${drift.y}px`,
						animationDuration: `${drift.seconds}s`,
						// A negative delay starts each disc somewhere else in its loop
						animationDelay: `${-index * 1.3}s`,
					} as CSSProperties
				}
			>
				<NextLink
					href={href}
					aria-label={label}
					className={cn(
						// Turns against the orbit, so the label stays upright
						'animate-orbit-reverse group-focus-within/orbit:[animation-play-state:paused] group-hover/orbit:[animation-play-state:paused] motion-reduce:animate-none',
						'focus-visible:ring-primary-foreground flex size-full flex-col items-center justify-center rounded-full p-[10%] text-center leading-tight font-medium wrap-break-word hyphens-auto transition-transform duration-150 hover:scale-105 focus-visible:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
						tone,
					)}
				>
					{children}
				</NextLink>
			</div>
		</div>
	);
};

// Less padding than active discs, so a long word such as "Communication" fits the smaller disc
const interestedTone = 'border-primary-foreground/70 bg-foreground/50 text-primary-foreground border border-dashed p-[6%]';

// The last word gets a line of its own ("Technology / Circle"), so every disc reads the same however wide it is
const DiscLabel = ({ label }: { label: string }) => {
	const text = label.trim();
	const lastSpace = text.lastIndexOf(' ');
	if (lastSpace === -1) {
		return text;
	}

	return (
		<>
			{text.slice(0, lastSpace)}
			<br />
			{text.slice(lastSpace + 1)}
		</>
	);
};

const LegendItem = ({ tone, label }: { tone: string; label: string }) => (
	<li className="inline-flex items-center gap-1.5">
		<span aria-hidden="true" className={cn('size-3 shrink-0 rounded-full', tone)} />
		{label}
	</li>
);

/**
 * A round portrait with the circles a person belongs to as discs that overlap its edge. Every measure is a share
 * of the frame width, so the whole composition scales with the space it gets.
 */
export const PersonCircles = ({
	image,
	initials,
	activeCircles = [],
	interestedCircles = [],
	legend,
	more,
}: PersonCirclesProps) => {
	const activeDiscs = limitActiveDiscs(activeCircles);
	const interestedDiscs = limitInterestedDiscs(interestedCircles);
	const activeCount = activeDiscs.shown.length + (activeDiscs.moreCount > 0 ? 1 : 0);
	const activeAngles = getActiveDiscAngles(activeCount);
	const isSingle = activeCount === 1;
	const activeDisc = {
		distance: active.distance,
		diameter: isSingle ? active.largeDiameter : active.diameter,
	};
	const activeText = isSingle ? 'text-[max(0.75rem,3.1cqw)]' : 'text-[max(0.625rem,2.56cqw)]';
	const interestedDisc = { distance: interested.distance, diameter: interested.diameter };

	return (
		<div className="@container w-full">
			<div className="group/orbit text-foreground relative aspect-square w-full">
				{ringRadii.map((radius) => (
					<div
						key={radius}
						aria-hidden="true"
						className="border-primary-foreground/15 animate-breathe absolute aspect-square -translate-1/2 rounded-full border motion-reduce:animate-none"
						style={centered(radius * 2)}
					/>
				))}

				<div
					className="shadow-overlay animate-fade-in absolute aspect-square -translate-1/2 overflow-hidden rounded-full motion-reduce:animate-none"
					style={centered(2)}
				>
					{image ? (
						<NextImage
							src={image.src}
							alt={image.alt}
							fill
							priority
							sizes="(min-width: 1024px) 280px, 50vw"
							className="object-cover"
						/>
					) : (
						<div
							aria-hidden="true"
							className="text-primary-foreground flex size-full items-center justify-center bg-linear-to-br from-[hsl(var(--gradient-card-from))] to-[hsl(var(--gradient-card-to))] text-[14cqw] font-bold"
						>
							{initials}
						</div>
					)}
				</div>

				{/* All discs circle the portrait slowly and stop while the pointer or focus is on the composition */}
				<PersonCirclesOrbit>
					{activeDiscs.shown.map((circle, index) => (
						<Disc
							key={circle.href}
							href={circle.href}
							index={index}
							angle={activeAngles[index]}
							tone={activeTone}
							textSize={activeText}
							{...activeDisc}
						>
							<DiscLabel label={circle.label} />
						</Disc>
					))}
					{activeDiscs.moreCount > 0 ? (
						<Disc
							href={more.href}
							index={activeCount - 1}
							angle={activeAngles[activeCount - 1]}
							tone={activeTone}
							textSize="text-[max(0.875rem,4cqw)]"
							label={more.getLabel(activeDiscs.moreCount)}
							{...activeDisc}
						>
							+{activeDiscs.moreCount}
						</Disc>
					) : null}

					{interestedDiscs.shown.map((circle, index) => (
						<Disc
							key={circle.href}
							href={circle.href}
							index={activeCount + index}
							angle={interested.angles[index]}
							{...interestedDisc}
							tone={interestedTone}
							textSize="text-[max(0.5rem,2.1cqw)]"
							label={`${circle.label}, ${legend.interested}`}
						>
							<DiscLabel label={circle.label} />
						</Disc>
					))}
					{interestedDiscs.moreCount > 0 ? (
						<Disc
							href={more.href}
							index={activeCount + interestedDiscs.shown.length}
							angle={interested.angles[interestedDiscs.shown.length]}
							label={more.getLabel(interestedDiscs.moreCount)}
							{...interestedDisc}
							tone={interestedTone}
							textSize="text-[max(0.875rem,3.6cqw)]"
						>
							+{interestedDiscs.moreCount}
						</Disc>
					) : null}
				</PersonCirclesOrbit>
			</div>
			{/* Only the dashed follower discs need explaining; the legend names the kinds that are shown */}
			{interestedDiscs.shown.length > 0 ? (
				<ul className="text-primary-foreground/75 mt-4 flex flex-wrap justify-center gap-x-4.5 gap-y-1 text-sm">
					{activeCount > 0 ? <LegendItem tone={activeTone} label={legend.active} /> : null}
					<LegendItem tone={interestedTone} label={legend.interested} />
				</ul>
			) : null}
		</div>
	);
};
