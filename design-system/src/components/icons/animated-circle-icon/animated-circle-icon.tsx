'use client';

import { useId } from 'react';
import { usePrefersReducedMotion } from '../../../use-media-query';
import { type CircleMarkVariant, DotGradient, RingGradient } from './circle-mark-gradients';

// Strokes and dots this thick only read well at icon sizes
const SMALL_ICON_MAX_SIZE = 40;

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
	variant?: CircleMarkVariant;
};

/**
 * A decorative ring with a dot orbiting it. Renders still when the user prefers reduced motion.
 * Inside a surface with `scheme-dark` it switches to colors that stand out on dark backgrounds.
 */
export const AnimatedCircleIcon = ({ size = 22, variant = 'default' }: AnimatedCircleIconProps) => {
	const id = useId();
	const animated = !usePrefersReducedMotion();
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
				<RingGradient id={ids.ringGradient} variant={variant} animated={animated} />
				<DotGradient id={ids.dotGradient} variant={variant} />
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
