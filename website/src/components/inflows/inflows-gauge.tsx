'use client';

import { formatSummaryMetricAmount } from '@/components/transparency/summary-metric-format';
import { useCountUp } from '@/lib/hooks/use-count-up';
import { usePrefersReducedMotion } from '@/lib/hooks/use-prefers-reduced-motion';
import { getSafeNumberFormatLocale, type WebsiteLanguage } from '@/lib/i18n/utils';
import { cn } from '@/lib/utils/cn';
import { useInView } from 'motion/react';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

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
const SEGMENT_GAP_DEG = 2.5;
const SEGMENT_DURATION_MS = 900;
const SCROLL_THRESHOLD = 0.2;
/** Keep SVG user-space large for smoother stroke rasterization when scaled to CSS pixels. */
const GAUGE_SCALE = 4;

const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

const segmentProgressAt = (segmentIndex: number, elapsedMs: number): number => {
	const segmentStart = segmentIndex * SEGMENT_DURATION_MS;
	const linear = Math.min(Math.max((elapsedMs - segmentStart) / SEGMENT_DURATION_MS, 0), 1);

	return easeOutQuart(linear);
};

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
	const span = endDeg - startDeg;
	if (span <= 0) {
		return '';
	}
	const largeArc = span > 180 ? 1 : 0;

	return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
};

type SegmentArc = {
	key: string;
	color: string;
	startDeg: number;
	endDeg: number;
};

const buildSegmentArcs = (segments: GaugeSegment[]): SegmentArc[] => {
	let cumulative = 0;
	const lastIndex = segments.length - 1;

	return segments.map((seg, index) => {
		const gapBefore = index > 0 ? SEGMENT_GAP_DEG / 2 : 0;
		const gapAfter = index < lastIndex ? SEGMENT_GAP_DEG / 2 : 0;
		const startDeg = ARC_START_DEG + (cumulative / 100) * ARC_SPAN_DEG + gapBefore;
		cumulative += seg.percent;
		const endDeg = ARC_START_DEG + (cumulative / 100) * ARC_SPAN_DEG - gapAfter;

		return { key: seg.key, color: seg.color, startDeg, endDeg };
	});
};

const runArcAnimation = (totalAnimationMs: number, onElapsed: (elapsed: number) => void, signal: AbortSignal) => {
	let startTime: number | null = null;
	let animationFrameId = 0;

	const animate = (timestamp: number) => {
		if (signal.aborted) {
			return;
		}
		startTime ??= timestamp;
		const elapsed = timestamp - startTime;
		onElapsed(Math.min(elapsed, totalAnimationMs));

		if (elapsed < totalAnimationMs) {
			animationFrameId = requestAnimationFrame(animate);
		}
	};

	animationFrameId = requestAnimationFrame(animate);

	return () => cancelAnimationFrame(animationFrameId);
};

const isInViewport = (element: HTMLElement): boolean => {
	const rect = element.getBoundingClientRect();

	return rect.top < window.innerHeight && rect.bottom > 0;
};

export const InflowsGauge = ({ segments, centerValue, centerLabel, centerCurrencyLabel, lang, className }: Props) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const arcCancelRef = useRef<(() => void) | null>(null);
	const [animationElapsed, setAnimationElapsed] = useState(0);
	const reduceMotion = usePrefersReducedMotion();

	const locale = getSafeNumberFormatLocale(lang);
	const isInView = useInView(containerRef, { once: true, amount: 0.2 });
	const animatedCenter = useCountUp(centerValue, isInView && !reduceMotion);
	const displayCenter = reduceMotion || !isInView ? centerValue : animatedCenter;
	const { value: centerDisplayValue, suffix: centerSuffix } = formatSummaryMetricAmount(displayCenter, locale);

	const segmentArcs = useMemo(() => buildSegmentArcs(segments), [segments]);
	const totalAnimationMs = Math.max(segmentArcs.length, 1) * SEGMENT_DURATION_MS;
	const effectiveElapsed = reduceMotion ? totalAnimationMs : animationElapsed;

	const viewW = 200 * GAUGE_SCALE;
	const viewH = 118 * GAUGE_SCALE;
	const cx = viewW / 2;
	const cy = viewH - 8 * GAUGE_SCALE;
	const radius = 74 * GAUGE_SCALE;
	const strokeWidth = 10 * GAUGE_SCALE;
	const viewBoxX = cx - radius - strokeWidth / 2;
	const arcTopY = cy - radius - strokeWidth / 2;
	const viewBoxY = arcTopY - 2 * GAUGE_SCALE;
	const viewBoxW = 2 * (radius + strokeWidth / 2);
	const viewBoxH = viewH - viewBoxY;

	const dataKey = String(centerValue);

	const playArcAnimation = useCallback(() => {
		arcCancelRef.current?.();
		arcCancelRef.current = null;

		setAnimationElapsed(0);
		const controller = new AbortController();
		const cancelFrame = runArcAnimation(totalAnimationMs, setAnimationElapsed, controller.signal);
		arcCancelRef.current = () => {
			controller.abort();
			cancelFrame();
		};
	}, [totalAnimationMs]);

	useLayoutEffect(() => {
		if (reduceMotion) {
			return;
		}

		const element = containerRef.current;
		if (!element) {
			return;
		}

		let cancelled = false;
		let observer: IntersectionObserver | null = null;

		const runOnce = () => {
			if (cancelled) {
				return;
			}
			playArcAnimation();
		};

		if (isInViewport(element)) {
			runOnce();
		} else {
			observer = new IntersectionObserver(
				([entry]) => {
					if (!entry?.isIntersecting) {
						return;
					}
					observer?.disconnect();
					runOnce();
				},
				{ threshold: SCROLL_THRESHOLD, rootMargin: '0px 0px 40% 0px' },
			);
			observer.observe(element);
		}

		return () => {
			cancelled = true;
			observer?.disconnect();
			arcCancelRef.current?.();
			arcCancelRef.current = null;
		};
	}, [dataKey, playArcAnimation, reduceMotion]);

	const ariaLabel = [
		`${centerLabel} ${centerCurrencyLabel}: ${centerDisplayValue}${centerSuffix ?? ''}`,
		...segments.map((seg) => `${seg.label}: ${seg.percent}%`),
	].join(', ');

	return (
		<div
			ref={containerRef}
			className={cn('relative w-full', className)}
			style={{ aspectRatio: `${viewBoxW} / ${viewBoxH}` }}
		>
			<svg
				role="img"
				aria-label={ariaLabel}
				viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}`}
				preserveAspectRatio="xMidYMax slice"
				shapeRendering="geometricPrecision"
				className="h-full w-full overflow-visible"
			>
				{segmentArcs.map((arc, index) => {
					const progress = segmentProgressAt(index, effectiveElapsed);
					const animatedEnd = arc.startDeg + (arc.endDeg - arc.startDeg) * progress;
					const path = describeArc(cx, cy, radius, arc.startDeg, animatedEnd);
					if (!path) {
						return null;
					}

					return (
						<path
							key={arc.key}
							d={path}
							fill="none"
							stroke={arc.color}
							strokeWidth={strokeWidth}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					);
				})}
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
