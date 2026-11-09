'use client';

import { ArrowUpRight } from 'lucide-react';
import NextLink from 'next/link';
import { useId } from 'react';
import { useMediaQuery, usePrefersReducedMotion } from '../../../use-media-query';
import { DotGradient, RingGradient } from '../../icons/animated-circle-icon/circle-mark-gradients';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../overlays/tool-tip/tool-tip';
import { CIRCLE_CONFIG, useCircleSimulation } from './use-circle-simulation';

// Matches Tailwind's md breakpoint, where the card turns from a row into a tile
const COMPACT_QUERY = '(width < 48rem)';

type MemberKind = 'active' | 'interested' | 'none';

const InterestedGradient = ({ id }: { id: string }) => (
	<linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
		<stop offset="0" stopColor={CIRCLE_CONFIG.colors.interested[0]} />
		<stop offset="1" stopColor={CIRCLE_CONFIG.colors.interested[1]} />
	</linearGradient>
);

const MemberDot = ({ kind }: { kind: MemberKind }) => {
	const gradientId = useId();

	// The same size as the members in the circle visual: 17px of a 200px tile, about 10px of a 96px row
	return (
		<svg viewBox="0 0 10 10" className="size-2.5 shrink-0 md:size-4.25" aria-hidden focusable="false">
			{kind === 'none' ? (
				<circle cx="5" cy="5" r="4.5" strokeWidth="1" className="fill-muted stroke-input" />
			) : (
				<>
					<defs>
						{kind === 'active' ? <DotGradient id={gradientId} variant="default" /> : <InterestedGradient id={gradientId} />}
					</defs>
					<circle cx="5" cy="5" r="5" fill={`url(#${gradientId})`} />
				</>
			)}
		</svg>
	);
};

type CircleVisualProps = {
	activeCount: number;
	interestedCount: number;
	seed: string;
};

const CircleVisual = ({ activeCount, interestedCount, seed }: CircleVisualProps) => {
	const id = useId();
	const animated = !usePrefersReducedMotion();
	const compact = useMediaQuery(COMPACT_QUERY, false);
	const { layout, svgRef, pulseRef, setDotRef } = useCircleSimulation({ activeCount, seed, compact, animated });
	const { center, ringRadius, orbit, orbitDotShare, pulse, colors } = CIRCLE_CONFIG;
	const baseDotRadius = compact ? CIRCLE_CONFIG.dotRadius.compact : CIRCLE_CONFIG.dotRadius.regular;
	// Each dot may cover `orbitDotShare` of its stretch of the orbit
	const satelliteRadius = Math.min(baseDotRadius, (Math.PI * orbit.radius * orbitDotShare) / Math.max(interestedCount, 1));
	const ids = { ring: `${id}-ring`, active: `${id}-active`, interested: `${id}-interested` };

	return (
		<svg
			ref={svgRef}
			viewBox="0 0 200 200"
			aria-hidden
			focusable="false"
			className="size-24 shrink-0 transition-transform duration-900 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-110 motion-safe:group-focus-visible:scale-110 motion-safe:group-active:scale-110 md:size-50"
		>
			<defs>
				<RingGradient id={ids.ring} variant="default" animated={animated} />
				<DotGradient id={ids.active} variant="default" />
				<InterestedGradient id={ids.interested} />
			</defs>

			{interestedCount > 0 && (
				<circle
					cx={center}
					cy={center}
					r={orbit.radius}
					fill="none"
					stroke={colors.orbit}
					strokeWidth={orbit.stroke}
					strokeDasharray={orbit.dash}
					strokeLinecap="round"
				/>
			)}
			<circle
				cx={center}
				cy={center}
				r={ringRadius}
				fill="none"
				stroke={`url(#${ids.ring})`}
				strokeWidth={layout.ringStroke}
			/>

			{animated && activeCount > 1 && (
				<circle
					ref={pulseRef}
					cx={center}
					cy={center}
					r={layout.dotRadius}
					fill="none"
					stroke={colors.pulse}
					strokeWidth={pulse.stroke}
					opacity="0"
				/>
			)}
			{layout.positions.map(({ id, x, y }, index) => (
				<circle
					key={id}
					ref={setDotRef(index)}
					cx={center + x}
					cy={center + y}
					r={layout.dotRadius}
					fill={`url(#${ids.active})`}
				/>
			))}

			{interestedCount > 0 && (
				<g>
					{animated && (
						<animateTransform
							attributeName="transform"
							type="rotate"
							values={`0 ${center} ${center};-360 ${center} ${center}`}
							dur={`${orbit.secondsPerTurn}s`}
							repeatCount="indefinite"
						/>
					)}
					{Array.from({ length: interestedCount }, (_, index) => {
						const angle = -Math.PI / 2 + (index * 2 * Math.PI) / interestedCount;

						return (
							<circle
								key={index}
								cx={center + orbit.radius * Math.cos(angle)}
								cy={center + orbit.radius * Math.sin(angle)}
								r={satelliteRadius}
								fill={`url(#${ids.interested})`}
							/>
						);
					})}
				</g>
			)}
		</svg>
	);
};

const MemberCount = ({ kind, label }: { kind: MemberKind; label: string }) => (
	<span className="inline-flex items-center gap-1.5">
		<MemberDot kind={kind} />
		{label}
	</span>
);

type CircleCardProps = {
	title: string;
	href: string;
	activeCount: number;
	interestedCount: number;
	// e.g. "5 Members"
	activeLabel: string;
	// e.g. "2 Followers"; hidden when there are none
	interestedLabel: string;
};

/**
 * A linked card for a group such as a circle of volunteers: active members move inside a ring and now and then gather
 * around one who "speaks"; interested members sit on a dotted orbit around it.
 */
export const CircleCard = ({ title, href, activeCount, interestedCount, activeLabel, interestedLabel }: CircleCardProps) => (
	<NextLink
		href={href}
		className="group bg-background shadow-card hover:shadow-raised focus-visible:shadow-raised focus-visible:outline-primary relative flex h-full items-center gap-4 rounded-3xl py-3.5 pr-4 pl-3 transition-[translate,box-shadow] duration-350 ease-[cubic-bezier(0.2,0.7,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-4 motion-safe:hover:-translate-y-1 motion-safe:focus-visible:-translate-y-1 md:flex-col md:gap-0 md:rounded-4xl md:px-7 md:pt-10 md:pb-8.5 md:text-center"
	>
		<CircleVisual activeCount={activeCount} interestedCount={interestedCount} seed={href} />
		<div className="flex min-w-0 flex-1 flex-col gap-1 md:mt-5.5 md:gap-2">
			<p className="text-primary text-lg font-semibold md:text-2xl">
				{title}
				{/* Commas for screen readers, which read the link as one line */}
				<span className="sr-only">, </span>
			</p>
			<p className="text-muted-foreground flex flex-wrap items-center gap-x-4.5 gap-y-1 text-sm md:justify-center">
				<MemberCount kind={activeCount > 0 ? 'active' : 'none'} label={activeLabel} />
				{interestedCount > 0 && (
					<>
						<span className="sr-only">, </span>
						<MemberCount kind="interested" label={interestedLabel} />
					</>
				)}
			</p>
		</div>
		<span
			aria-hidden
			className="bg-muted text-primary group-hover:bg-primary group-hover:text-primary-foreground group-focus-visible:bg-primary group-focus-visible:text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full transition-[translate,background-color,color] duration-350 ease-[cubic-bezier(0.2,0.7,0.3,1)] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-focus-visible:translate-x-0.5 motion-safe:group-focus-visible:-translate-y-0.5 md:absolute md:top-5 md:right-5 md:size-10"
		>
			<ArrowUpRight className="size-4" />
		</span>
	</NextLink>
);

const LegendItem = ({ kind, label, description }: { kind: MemberKind; label: string; description: string }) => (
	<li className="inline-flex items-center gap-1.5">
		<MemberDot kind={kind} />
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					className="decoration-muted-foreground/60 hover:text-foreground focus-visible:ring-ring cursor-help rounded-xs underline decoration-dotted underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
				>
					{label}
				</button>
			</TooltipTrigger>
			<TooltipContent sideOffset={8}>{description}</TooltipContent>
		</Tooltip>
	</li>
);

type CircleCardLegendProps = {
	// e.g. "Circle Members"
	activeLabel: string;
	// Shown on hover, focus or tap, e.g. what members do
	activeDescription: string;
	// e.g. "Followers"
	interestedLabel: string;
	interestedDescription: string;
};

export const CircleCardLegend = ({
	activeLabel,
	activeDescription,
	interestedLabel,
	interestedDescription,
}: CircleCardLegendProps) => (
	<ul className="text-muted-foreground flex flex-wrap gap-x-4.5 gap-y-1 text-sm">
		<LegendItem kind="active" label={activeLabel} description={activeDescription} />
		<LegendItem kind="interested" label={interestedLabel} description={interestedDescription} />
	</ul>
);
