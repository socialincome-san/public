'use client';

import NextLink from 'next/link';
import { useEffect, useRef } from 'react';
import { Card } from '../card/card';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const VIEWBOX_CENTER = 50;
const DOTS_AREA_RADIUS = 42;
const MAX_DOT_RADIUS = 6;
// In viewBox units per second
const DOT_SPEED = 4;
// Longer frame gaps (a background tab) would make dots jump through the edge
const MAX_FRAME_SECONDS = 0.05;
// More dots get too small to see and too costly to simulate, so larger groups are scaled down to this
const MAX_DOTS = 60;

type Dot = { x: number; y: number; vx: number; vy: number };

const getDotRadius = (count: number) => Math.min(MAX_DOT_RADIUS, (DOTS_AREA_RADIUS * 0.6) / Math.sqrt(count));

// A sunflower spiral spreads any number of dots evenly, so the first render (and reduced motion) looks settled
const getInitialDots = (count: number, dotRadius: number): Dot[] =>
	Array.from({ length: count }, (_, index) => {
		const distance = count === 1 ? 0 : (DOTS_AREA_RADIUS - dotRadius) * Math.sqrt((index + 0.5) / count);
		const angle = index * GOLDEN_ANGLE;
		const heading = angle * 7;

		return {
			x: VIEWBOX_CENTER + distance * Math.cos(angle),
			y: VIEWBOX_CENTER + distance * Math.sin(angle),
			vx: DOT_SPEED * Math.cos(heading),
			vy: DOT_SPEED * Math.sin(heading),
		};
	});

const keepInsideCircle = (dot: Dot, dotRadius: number) => {
	const dx = dot.x - VIEWBOX_CENTER;
	const dy = dot.y - VIEWBOX_CENTER;
	const distance = Math.hypot(dx, dy);
	const maxDistance = DOTS_AREA_RADIUS - dotRadius;
	if (distance <= maxDistance || distance === 0) {
		return;
	}

	const nx = dx / distance;
	const ny = dy / distance;
	dot.x = VIEWBOX_CENTER + nx * maxDistance;
	dot.y = VIEWBOX_CENTER + ny * maxDistance;
	const outward = dot.vx * nx + dot.vy * ny;
	if (outward > 0) {
		dot.vx -= 2 * outward * nx;
		dot.vy -= 2 * outward * ny;
	}
};

// Overlapping dots are pushed apart and swap their speed along the line between them, like billiard balls
const separate = (first: Dot, second: Dot, dotRadius: number) => {
	const dx = second.x - first.x;
	const dy = second.y - first.y;
	const distance = Math.hypot(dx, dy);
	const minDistance = dotRadius * 2.4;
	if (distance >= minDistance || distance === 0) {
		return;
	}

	const nx = dx / distance;
	const ny = dy / distance;
	const push = (minDistance - distance) / 2;
	first.x -= nx * push;
	first.y -= ny * push;
	second.x += nx * push;
	second.y += ny * push;
	const exchange = (first.vx - second.vx) * nx + (first.vy - second.vy) * ny;
	if (exchange > 0) {
		first.vx -= exchange * nx;
		first.vy -= exchange * ny;
		second.vx += exchange * nx;
		second.vy += exchange * ny;
	}
};

type FloatingDotsProps = {
	solidCount: number;
	outlinedCount: number;
};

const FloatingDots = ({ solidCount: totalSolid, outlinedCount: totalOutlined }: FloatingDotsProps) => {
	const total = totalSolid + totalOutlined;
	const count = Math.min(total, MAX_DOTS);
	const solidCount = total > MAX_DOTS ? Math.round((totalSolid / total) * MAX_DOTS) : totalSolid;
	const dotRadius = getDotRadius(count);
	const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
	const initialDots = getInitialDots(count, dotRadius);

	useEffect(() => {
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		if (count === 0 || reducedMotion.matches) {
			return;
		}

		const dots = getInitialDots(count, dotRadius);
		let previousTime = performance.now();
		let frame = requestAnimationFrame(function step(time) {
			const seconds = Math.min((time - previousTime) / 1000, MAX_FRAME_SECONDS);
			previousTime = time;

			for (const dot of dots) {
				dot.x += dot.vx * seconds;
				dot.y += dot.vy * seconds;
			}
			for (let i = 0; i < dots.length; i++) {
				for (let j = i + 1; j < dots.length; j++) {
					separate(dots[i], dots[j], dotRadius);
				}
			}
			dots.forEach((dot, index) => {
				keepInsideCircle(dot, dotRadius);
				dotRefs.current[index]?.setAttribute('cx', String(dot.x));
				dotRefs.current[index]?.setAttribute('cy', String(dot.y));
			});

			frame = requestAnimationFrame(step);
		});

		const stopOnReducedMotion = (event: MediaQueryListEvent) => {
			if (event.matches) {
				cancelAnimationFrame(frame);
			}
		};
		reducedMotion.addEventListener('change', stopOnReducedMotion);

		return () => {
			cancelAnimationFrame(frame);
			reducedMotion.removeEventListener('change', stopOnReducedMotion);
		};
	}, [count, dotRadius]);

	return (
		<svg viewBox="0 0 100 100" className="size-40" aria-hidden>
			<circle cx={VIEWBOX_CENTER} cy={VIEWBOX_CENTER} r="48" className="fill-muted stroke-border" strokeWidth="1" />
			{initialDots.map((dot, index) => (
				<circle
					key={index}
					ref={(element) => {
						dotRefs.current[index] = element;
					}}
					cx={dot.x}
					cy={dot.y}
					{...(index < solidCount
						? { r: dotRadius, className: 'fill-primary' }
						: { r: dotRadius * 0.85, className: 'stroke-primary fill-none', strokeWidth: dotRadius * 0.3 })}
				/>
			))}
		</svg>
	);
};

type DotCircleCardProps = {
	title: string;
	// Shown below the title, e.g. "6 members"
	description: string;
	solidCount: number;
	// Drawn after the solid dots as outlines, e.g. people who are only interested
	outlinedCount?: number;
	href: string;
};

export const DotCircleCard = ({ title, description, solidCount, outlinedCount = 0, href }: DotCircleCardProps) => (
	<NextLink
		href={href}
		className="focus-visible:ring-ring block h-full rounded-3xl focus-visible:ring-2 focus-visible:outline-none"
	>
		<Card elevation="flat" padding="compact" interactive fullHeight>
			<div className="flex flex-col items-center gap-6 py-2 text-center">
				<FloatingDots solidCount={solidCount} outlinedCount={outlinedCount} />
				<div className="flex flex-col gap-1">
					<p className="text-xl font-medium">{title}</p>
					<p className="text-muted-foreground text-sm">{description}</p>
				</div>
			</div>
		</Card>
	</NextLink>
);
