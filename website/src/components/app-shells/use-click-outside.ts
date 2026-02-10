'use client';

import { RefObject, useEffect } from 'react';

export function useClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void) {
	useEffect(() => {
		const listener = (event: MouseEvent) => {
			if (!ref.current) {
				return;
			}
			if (!ref.current.contains(event.target as Node)) {
				handler();
			}
		};

		document.addEventListener('mousedown', listener);

		return () => {
			document.removeEventListener('mousedown', listener);
		};
	}, [ref, handler]);
}
