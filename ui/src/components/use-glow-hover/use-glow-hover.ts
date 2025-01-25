'use client';

import { useEffect, useRef } from 'react';

import { glowHoverEffect, GlowHoverOptions } from './glow-hover-effect';

export type GlowHoverHookOptions = GlowHoverOptions & { disabled?: boolean };
export const useGlowHover = ({ disabled = false, ...options }: GlowHoverHookOptions) => {
	const ref = useRef<HTMLElement>(null);

	useEffect(
		() => (!disabled && ref.current ? glowHoverEffect(ref.current, options) : () => {}),
		[disabled, ...Object.values(options)],
	);
	return ref;
};
