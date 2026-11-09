'use client';

import { useId, useSyncExternalStore } from 'react';

// Illustration colors without a matching theme token; default ring and dark dot stop equal --gradient-card-* and --primary.
// Dark surfaces declare `color-scheme: dark` (`scheme-dark`) and get the onDark colors, e.g. a light dot.
const variants = {
	default: {
		ring: ['#5792B7', '#CED3CA'],
		ringOnDark: ['#5792B7', '#CED3CA'],
		dot: ['#083344', '#0B728E'],
		dotOnDark: ['#F8FAFC', '#CED3CA'],
	},
	deep: {
		ring: ['#075783', '#9AB6AD'],
		// #075783 almost disappears on dark blue
		ringOnDark: ['#4D90A3', '#9AB6AD'],
		dot: ['#083344', '#075783'],
		dotOnDark: ['#F8FAFC', '#9AB6AD'],
	},
	cyanDeep: {
		ring: ['#07B6D5', '#0B728E'],
		ringOnDark: ['#07B6D5', '#0B728E'],
		dot: ['#075783', '#083344'],
		dotOnDark: ['#F8FAFC', '#07B6D5'],
	},
	seaGlass: {
		ring: ['#95B7AD', '#4D90A3'],
		ringOnDark: ['#95B7AD', '#4D90A3'],
		dot: ['#083344', '#075783'],
		dotOnDark: ['#F8FAFC', '#95B7AD'],
	},
} as const;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
// Strokes and dots this thick only read well at icon sizes
const SMALL_ICON_MAX_SIZE = 40;

const subscribeToReducedMotion = (onChange: () => void) => {
	const query = window.matchMedia(REDUCED_MOTION_QUERY);
	query.addEventListener('change', onChange);

	return () => query.removeEventListener('change', onChange);
};

// The attribute is the fallback for browsers without light-dark()
const AdaptiveStop = ({ offset, light, dark }: { offset: number; light: string; dark: string }) => (
	<stop offset={offset} stopColor={light} style={{ stopColor: `light-dark(${light}, ${dark})` }} />
);

const OrbitAnimation = () => (
	<animateTransform
		attributeName="transform"
		type="rotate"
		values="0 50 50;0 50 50;360 50 50"
		keyTimes="0;0.3;1"
		calcMode="spline"
		keySplines="0 0 1 1;0.6 0 0.3 1"
		dur="9s"
		repeatCount="indefinite"
	/>
);

type AnimatedCircleIconProps = {
	size?: number;
	variant?: keyof typeof variants;
};

/**
 * A decorative ring with a dot orbiting it. Renders still when the user prefers reduced motion.
 * Inside a surface with `scheme-dark` it switches to colors that stand out on dark backgrounds.
 */
export const AnimatedCircleIcon = ({ size = 22, variant = 'default' }: AnimatedCircleIconProps) => {
	const id = useId();
	// The server and hydration render the still icon, so markup always matches
	const animated = !useSyncExternalStore(
		subscribeToReducedMotion,
		() => window.matchMedia(REDUCED_MOTION_QUERY).matches,
		() => true,
	);
	const { ring, ringOnDark, dot, dotOnDark } = variants[variant];
	const isSmall = size <= SMALL_ICON_MAX_SIZE;
	const strokeWidth = isSmall ? 13 : 10;
	const dotRadius = isSmall ? 15 : 13;
	const ids = {
		ringGradient: `${id}-ring-gradient`,
		dotGradient: `${id}-dot-gradient`,
		ringMask: `${id}-ring-mask`,
		dotMask: `${id}-dot-mask`,
	};

	const ringCircle = (stroke: string) => (
		<circle cx="50" cy="50" r="30" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
	);
	const orbitingDot = (fill: string) => (
		<g>
			{animated && <OrbitAnimation />}
			<circle cx="71.2" cy="71.2" r={dotRadius} fill={fill} />
		</g>
	);

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 100 100"
			className="inline-block shrink-0"
			aria-hidden="true"
			focusable="false"
		>
			<defs>
				<linearGradient id={ids.ringGradient} x1="0" y1="0" x2="1" y2="1">
					{animated && (
						<animateTransform
							attributeName="gradientTransform"
							type="rotate"
							values="0 .5 .5;360 .5 .5"
							dur="14s"
							repeatCount="indefinite"
						/>
					)}
					<AdaptiveStop offset={0} light={ring[0]} dark={ringOnDark[0]} />
					<AdaptiveStop offset={1} light={ring[1]} dark={ringOnDark[1]} />
				</linearGradient>
				<linearGradient id={ids.dotGradient} x1="0" y1="0" x2="1" y2="1">
					<AdaptiveStop offset={0} light={dot[0]} dark={dotOnDark[0]} />
					<AdaptiveStop offset={1} light={dot[1]} dark={dotOnDark[1]} />
				</linearGradient>
				{/* Each shape is cut where it meets the other, leaving a gap instead of one on top */}
				<mask id={ids.ringMask} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
					<rect width="100" height="100" fill="white" />
					{orbitingDot('black')}
				</mask>
				<mask id={ids.dotMask} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
					{orbitingDot('white')}
					{ringCircle('black')}
				</mask>
			</defs>
			<g mask={`url(#${ids.ringMask})`}>{ringCircle(`url(#${ids.ringGradient})`)}</g>
			<rect width="100" height="100" fill={`url(#${ids.dotGradient})`} mask={`url(#${ids.dotMask})`} />
		</svg>
	);
};
