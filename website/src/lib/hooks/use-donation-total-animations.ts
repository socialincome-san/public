'use client';

import { useCountUp } from '@/lib/hooks/use-count-up';
import { useInView, useMotionValue, useSpring, type MotionValue } from 'motion/react';
import { useEffect, useRef } from 'react';

type Params = {
	totalChf: number;
	disableAnimation?: boolean;
};

type Result = {
	sectionRef: React.RefObject<HTMLDivElement | null>;
	shouldAnimate: boolean;
	displayValue: number;
	smoothMouseX: MotionValue<number>;
	smoothMouseY: MotionValue<number>;
};

export const useDonationTotalAnimations = ({ totalChf, disableAnimation = false }: Params): Result => {
	const sectionRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
	const shouldAnimate = isInView && !disableAnimation;

	const animatedValue = useCountUp(totalChf, shouldAnimate);
	const displayValue = shouldAnimate ? animatedValue : totalChf;

	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
	const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

	useEffect(() => {
		if (!shouldAnimate) {
			return;
		}

		const el = sectionRef.current;
		if (!el) {
			return;
		}

		const handlePointerMove = (event: PointerEvent) => {
			const rect = el.getBoundingClientRect();
			const normalizedX = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
			const normalizedY = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);

			mouseX.set(Math.max(-1, Math.min(1, normalizedX)));
			mouseY.set(Math.max(-1, Math.min(1, normalizedY)));
		};

		window.addEventListener('pointermove', handlePointerMove);

		return () => window.removeEventListener('pointermove', handlePointerMove);
	}, [mouseX, mouseY, shouldAnimate]);

	return { sectionRef, shouldAnimate, displayValue, smoothMouseX, smoothMouseY };
};
