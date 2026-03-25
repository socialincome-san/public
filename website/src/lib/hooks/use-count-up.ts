'use client';

import { animate, useMotionValue } from 'motion/react';
import { useEffect, useState } from 'react';

export const useCountUp = (target: number, shouldStart: boolean): number => {
	const [displayValue, setDisplayValue] = useState(0);
	const value = useMotionValue(0);

	useEffect(() => {
		if (!shouldStart) {
			return;
		}

		const controls = animate(value, target, { duration: 2, ease: 'easeOut' });
		const unsubscribe = value.on('change', setDisplayValue);

		return () => {
			controls.stop();
			unsubscribe();
		};
	}, [shouldStart, target, value]);

	return displayValue;
};
