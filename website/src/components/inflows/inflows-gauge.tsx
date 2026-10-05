'use client';

import { formatSummaryMetricAmount } from '@/components/transparency/summary-metric-format';
import { useCountUp } from '@/lib/hooks/use-count-up';
import { usePrefersReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { cn } from '@/lib/utils/cn';
import { useInView } from 'motion/react';
import { useMemo, useRef } from 'react';

type GaugeSegment = {
	key: string;
	label: string;
	percent: number;
	color: string;
};

type Props = {
	segments: GaugeSegment[];
	centerValue: number;
	centerLabel: string;
	centerCurrencyLabel: string;
	lang: WebsiteLanguage;
	className?: string;
};

const ARC_START_DEG = 180;
const ARC_END_DEG = 360;
const ARC_SPAN_DEG = ARC_END_DEG - ARC_START_DEG;
/** Neighbours reach past their shared boundary so the round caps overlap instead of leaving a notch where they meet. */
const SEGMENT_OVERLAP_DEG = 1.5;
/** Segments draw one after the other, so the stagger equals the duration of `--animate-gauge-arc-draw`. */
const SEGMENT_STAGGER_MS = 900;
const SCROLL_THRESHOLD = 0.2;

const VIEW_HEIGHT = 118;
const CX = 100;
const CY = VIEW_HEIGHT - 8;
const RADIUS = 74;
const STROKE_WIDTH = 10;
const VIEW_BOX_X = CX - RADIUS - STROKE_WIDTH / 2;
const VIEW_BOX_Y = CY - RADIUS - STROKE_WIDTH / 2 - 2;
const VIEW_BOX_W = 2 * (RADIUS + STROKE_WIDTH / 2);
const VIEW_BOX_H = VIEW_HEIGHT - VIEW_BOX_Y;

const polar = (cx: number, cy: number, r: number, angleDeg: number) => {
	const rad = (angleDeg * Math.PI) / 180;

	return {
		x: cx + r * Math.cos(rad),
		y: cy + r * Math.sin(rad),
	};
};

const describeArc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
	const start = polar(cx, cy, r, startDeg);
	const end = polar(cx, cy, r, endDeg);
	const largeArc = endDeg - startDeg > 180 ? 1 : 0;

	return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
};

type SegmentArc = {
	key: string;
	color: string;
	path: string;
};

const buildSegmentArcs = (segments: GaugeSegment[]): SegmentArc[] => {
	const drawableSegments = segments.filter((seg) => seg.percent > 0);
	const lastIndex = drawableSegments.length - 1;
	let cumulative = 0;

	return drawableSegments.map((seg, index) => {
		const overlapBefore = index > 0 ? SEGMENT_OVERLAP_DEG / 2 : 0;
		const overlapAfter = index < lastIndex ? SEGMENT_OVERLAP_DEG / 2 : 0;
		const startDeg = ARC_START_DEG + (cumulative / 100) * ARC_SPAN_DEG - overlapBefore;
		cumulative += seg.percent;
		const endDeg = ARC_START_DEG + (cumulative / 100) * ARC_SPAN_DEG + overlapAfter;

		return { key: seg.key, color: seg.color, path: describeArc(CX, CY, RADIUS, startDeg, endDeg) };
	});
};

export const InflowsGauge = ({ segments, centerValue, centerLabel, centerCurrencyLabel, lang, className }: Props) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const reduceMotion = usePrefersReducedMotion();

	const locale = getSafeNumberFormatLocale(lang);
	const isInView = useInView(containerRef, { once: true, amount: SCROLL_THRESHOLD });
	const isAnimating = isInView && !reduceMotion;
	const animatedCenter = useCountUp(centerValue, isAnimating);
	const displayCenter = isAnimating ? animatedCenter : centerValue;
	const { value: centerDisplayValue, suffix: centerSuffix } = formatSummaryMetricAmount(displayCenter, locale);

	const segmentArcs = useMemo(() => buildSegmentArcs(segments), [segments]);

	const ariaLabel = [
		`${centerLabel} ${centerCurrencyLabel}: ${centerDisplayValue}${centerSuffix ?? ''}`,
		...segments.map((seg) => `${seg.label}: ${seg.percent}%`),
	].join(', ');

	return (
		<div
			ref={containerRef}
			className={cn('relative w-full', className)}
			style={{ aspectRatio: `${VIEW_BOX_W} / ${VIEW_BOX_H}` }}
		>
			{/* The sub-pixel blur widens the antialiased edge of the thick curved stroke so it stops reading as stair-stepped on 1x displays. */}
			<svg
				role="img"
				aria-label={ariaLabel}
				viewBox={`${VIEW_BOX_X} ${VIEW_BOX_Y} ${VIEW_BOX_W} ${VIEW_BOX_H}`}
				preserveAspectRatio="xMidYMax slice"
				shapeRendering="geometricPrecision"
				className="h-full w-full overflow-visible blur-[0.4px]"
			>
				{segmentArcs.map((arc, index) => (
					<path
						key={arc.key}
						d={arc.path}
						fill="none"
						stroke={arc.color}
						strokeWidth={STROKE_WIDTH}
						strokeLinecap="round"
						pathLength={1}
						// The gap outruns the path so no zero-length dash lands on the end point, which a round cap would draw as a dot.
						strokeDasharray="1 2"
						strokeDashoffset={reduceMotion ? 0 : 1}
						className={isAnimating ? 'animate-gauge-arc-draw' : undefined}
						style={isAnimating ? { animationDelay: `${index * SEGMENT_STAGGER_MS}ms` } : undefined}
					/>
				))}
			</svg>

			<div className="pointer-events-none absolute inset-x-0 top-[64%] flex -translate-y-1/2 flex-col items-center gap-1 text-center">
				<p className="text-foreground text-sm">
					<span className="font-bold">{centerLabel}</span>
					<span className="font-normal"> {centerCurrencyLabel}</span>
				</p>
				<p className="text-foreground text-5xl leading-none font-normal sm:text-6xl md:text-7xl">
					<span className="font-bold">{centerDisplayValue}</span>
					{centerSuffix ? <span className="align-baseline text-[0.45em] font-normal">{centerSuffix}</span> : null}
				</p>
			</div>
		</div>
	);
};
