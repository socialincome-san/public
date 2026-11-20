'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const RAMP_MS = 2000;

const getOrbitAnimations = (element: HTMLElement) =>
	element
		.getAnimations({ subtree: true })
		.filter((animation) => animation instanceof CSSAnimation && animation.animationName === 'orbit');

// Eases in and out between 0 and 1
const smoothstep = (progress: number) => progress * progress * (3 - 2 * progress);

/**
 * Turns its children around the center with `animate-orbit`. A hidden tab would let the orbit run on and show the
 * discs somewhere else on return, so it stops while the page is hidden and speeds up gently when it is back.
 * Only the playback rate changes: play and pause stay with CSS, which pauses on hover and focus.
 */
export const PersonCirclesOrbit = ({ children }: { children: ReactNode }) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = ref.current;
		if (!element) {
			return;
		}
		let frame = 0;

		const setRate = (rate: number) => {
			for (const animation of getOrbitAnimations(element)) {
				animation.playbackRate = rate;
			}
		};

		const onVisibilityChange = () => {
			cancelAnimationFrame(frame);
			if (document.hidden) {
				setRate(0);

				return;
			}
			const start = performance.now();
			const ramp = (now: number) => {
				const progress = Math.min((now - start) / RAMP_MS, 1);
				setRate(smoothstep(progress));
				if (progress < 1) {
					frame = requestAnimationFrame(ramp);
				}
			};
			frame = requestAnimationFrame(ramp);
		};

		document.addEventListener('visibilitychange', onVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', onVisibilityChange);
			cancelAnimationFrame(frame);
		};
	}, []);

	return (
		<div
			ref={ref}
			className="animate-orbit absolute inset-0 group-focus-within/orbit:[animation-play-state:paused] group-hover/orbit:[animation-play-state:paused] motion-reduce:animate-none"
		>
			{children}
		</div>
	);
};
