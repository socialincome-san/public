'use client';

import {RefObject, useEffect, useRef} from 'react';

import { glowHoverEffect, GlowHoverOptions } from './glow-hover-effect';

export type GlowHoverHookOptions = GlowHoverOptions & { disabled?: boolean };
export const useGlowHover = <T extends HTMLElement>({ disabled = false, ...options }: GlowHoverHookOptions): RefObject<T> => {
	const ref = useRef<T>(null);

	useEffect(
		() => (!disabled && ref.current ? glowHoverEffect(ref.current, options as GlowHoverOptions) : () => {}),
		[disabled, ...Object.values(options)],
	);
	return ref;
};
