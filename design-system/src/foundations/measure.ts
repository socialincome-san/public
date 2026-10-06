import { useCallback, useState } from 'react';

// getComputedStyle returns a live declaration, so reading it during render stays current
export const useComputedStyle = () => {
	const [style, setStyle] = useState<CSSStyleDeclaration | null>(null);
	const ref = useCallback((element: HTMLElement | null) => {
		if (element) {
			setStyle(getComputedStyle(element));
		}
	}, []);

	return [ref, style] as const;
};

export const toHex = (rgb: string) => {
	const channels = rgb.match(/\d+(\.\d+)?/g)?.slice(0, 3);

	return channels ? `#${channels.map((channel) => Math.round(Number(channel)).toString(16).padStart(2, '0')).join('')}` : '';
};
